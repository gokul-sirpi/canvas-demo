import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers';
import Header from '../../layouts/header/Header';
import LayerCard from '../../layouts/layerCard/LayerCard';
import { UserProfile } from '../../types/UserProfile';
import { useDispatch } from 'react-redux';
import { updateLoadingState } from '../../context/loading/LoaderSlice';
import axios from 'axios';
import envurls, { keycloakEnv } from '../../utils/config';
import { GeoJsonObj } from '../../types/GeojsonType';
import { QueryParams, Resource } from '../../types/resource';
import {
  addCanvasLayer,
  updateLayerFetchingStatus,
} from '../../context/canvasLayers/canvasLayerSlice';
import { emitToast } from '../../lib/toastEmitter';
import { getAllUgixFeatures } from '../../lib/getAllUgixFeatures';
import { getCookieValue } from '../../lib/cookieManger';
import Intro from '../../layouts/Intro/Intro';
import SwipeLine from '../../layouts/swipeLine/SwipeLine';
import AdjustableFooter from '../../layouts/adjustableFooter/AdjustableFooter';
import { Sidebar } from '../../components/sidebar/Sidebar';

function Canvas({
  profileData,
  changePage,
  currentPage,
}: {
  profileData: UserProfile | undefined;
  changePage: (page: string) => void;
  currentPage: string;
}) {
  const singleRender = useRef(false);
  const [allResrources, setAllResources] = useState<Resource[]>([]);
  const resourcesFromCatalogue: string[] = [];
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentPage === 'canvas') {
      if (singleRender.current) {
        openLayerMap.clearMap();
      }

      singleRender.current = true;
      openLayerMap.setOlTarget('ol-map');
      getResourceData();

      return () => {
        openLayerMap.clearMap();
      };
    }
  }, [currentPage]);

  async function getResourceData() {
    const url =
      // keycloakEnv.realm === 'ugix'?
      'cat/v1/search?property=[type]&value=[[iudx:Resource]]';
    // : 'cat/v1/search?property=[plot]&value=[[true]]';

    const response = await axios.get(`${envurls.ugixServer}${url}`);

    if (response.status === 200 && response.data.results.length > 0) {
      setAllResources(response.data.results);
      renderWishListItems(response.data.results);
    } else {
      console.log('empty');
    }
  }

  async function renderWishListItems(resourceList: Resource[]) {
    const wishList = getCookieValue(envurls.catalogueCookie);
    if (wishList) {
      const parsedList = wishList.split(',');
      if (Array.isArray(parsedList)) {
        for (const id of parsedList) {
          for (const resource of resourceList)
            if (resource.id === id) {
              handleUgixLayerAddition(resource);
            }
        }
      }
    }
  }
  async function handleUgixLayerAddition(resource: Resource) {
    dispatch(updateLoadingState(true));
    const newLayer = openLayerMap.createNewUgixLayer(
      resource.label,
      resource.id,
      resource.resourceGroup,
      resource.ogcResourceInfo.geometryType
    );
    const queryParams: QueryParams = {
      offset: 1,
    };
    getAllUgixFeatures(
      resource,
      newLayer,
      queryParams,
      () => {
        dispatch(addCanvasLayer(newLayer));
        resourcesFromCatalogue.push(newLayer.layerId);
        openLayerMap.zoomToCombinedExtend(resourcesFromCatalogue);
        cleanUpSideEffects();
      },
      (message) => {
        emitToast('error', message);
        cleanUpSideEffects();
        dispatch(updateLayerFetchingStatus(newLayer.layerId));
      },
      () => {
        cleanUpSideEffects();
        dispatch(updateLayerFetchingStatus(newLayer.layerId));
      }
    );
  }
  function cleanUpSideEffects() {
    dispatch(updateLoadingState(false));
  }
  function handleFileDrop(event: React.DragEvent) {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0) {
      const files = event.dataTransfer.files;
      dispatch(updateLoadingState(true));
      for (const file of files) {
        const nameSplit = file.name.split('.');
        const type = nameSplit[nameSplit.length - 1];
        if (type === 'json' || type === 'geojson') {
          const fr = new FileReader();
          fr.readAsText(file);
          fr.onload = () => {
            try {
              const output = fr.result as string;
              const parsedData = JSON.parse(output) as GeoJsonObj;
              nameSplit.pop();
              const fileName = nameSplit.join();
              plotGeojsonData(parsedData, fileName);
              dispatch(updateLoadingState(false));
            } catch (err) {
              emitToast('error', 'Invalid file format');
              dispatch(updateLoadingState(false));
            }
          };
          fr.onerror = () => {
            emitToast('error', 'Unable to load file');
            dispatch(updateLoadingState(false));
          };
        } else {
          emitToast('error', 'Invalid file format');
          dispatch(updateLoadingState(false));
        }
      }
    }
  }
  function plotGeojsonData(data: GeoJsonObj, fileName: string) {
    const newLayer = openLayerMap.createNewUserLayer(
      fileName,
      'GeometryCollection'
    );
    newLayer.isCompleted = true;
    newLayer.editable = false;
    try {
      openLayerMap.addImportedGeojsonData(
        data,
        newLayer.layerId,
        newLayer.style
      );
      openLayerMap.zoomToFit(newLayer.layerId);
      dispatch(addCanvasLayer(newLayer));
    } catch (error) {
      emitToast('error', 'Invalid file format');
      dispatch(updateLoadingState(false));
    }
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
  }

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarContent, setSidebarContent] = useState<any>(null);

  useEffect(() => {
    // Initialize the map click event and pass setSidebarOpen, setSidebarContent
    openLayerMap.initialiseMapClickEvent(setIsSidebarOpen, setSidebarContent);
  }, []);

  return (
    <section className={styles.container}>
      <div className={styles.ol_map_container}>
        <div
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          id="ol-map"
          className={styles.ol_map}
        ></div>
        <>
          <SwipeLine />
          {/* <Popup /> */}
          {/* <Toolbar resourceList={allResrources} /> */}
          <Header
            profileData={profileData}
            changePage={changePage}
            currentPage={currentPage}
            resourceList={allResrources}
          />
          <LayerCard />
          <Intro />
          <Sidebar
            open={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            content={sidebarContent}
          />
        </>
      </div>
      <AdjustableFooter />
    </section>
  );
}
export default Canvas;
