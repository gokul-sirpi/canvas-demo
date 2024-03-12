import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers.ts';
import Header from '../../layouts/header/Header';
import LayerCard from '../../layouts/layerCard/LayerCard';
import { UserProfile } from '../../types/UserProfile.ts';
import { useDispatch } from 'react-redux';
import { updateLoadingState } from '../../context/loading/LoaderSlice.ts';
import axios from 'axios';
import envurls from '../../utils/config.ts';
import { GeoJsonObj } from '../../types/GeojsonType.ts';
import { QueryParams, Resource } from '../../types/resource.ts';
import { addGsixLayer } from '../../context/gsixLayers/gsixLayerSlice.ts';
import { addUserLayer } from '../../context/userLayers/userLayerSlice.ts';
import { emitToast } from '../../lib/toastEmitter.ts';
import Popup from '../../components/popup/Popup.tsx';
import Intro from '../../layouts/Intro/Intro.tsx';
import { getAllUgixFeatures } from '../../lib/getAllUgixFeatures.ts';

function Canvas({ profileData }: { profileData: UserProfile | undefined }) {
  const singleRender = useRef(false);
  const [allResrources, setAllResources] = useState<Resource[]>([]);
  const limit = 5;
  const dispatch = useDispatch();
  useEffect(() => {
    if (singleRender.current) return;
    singleRender.current = true;
    openLayerMap.setOlTarget('ol-map');
    getResourceData();
  }, []);
  async function getResourceData() {
    const response = await axios.get(
      envurls.ugixServer +
        'cat/v1/search?property=[type]&value=[[iudx:Resource]]'
    );
    if (response.status === 200 && response.data.results.length > 0) {
      setAllResources(response.data.results);
      renderWishListItems(response.data.results);
    }
  }

  function renderWishListItems(resourceList: Resource[]) {
    const wishList = getCookieValue('resWishlist');
    console.log(wishList);
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
      resource.id
    );
    const queryParams: QueryParams = {
      limit: limit,
      offset: 1,
    };
    getAllUgixFeatures(
      resource,
      newLayer,
      queryParams,
      () => {
        dispatch(addGsixLayer(newLayer));
      },
      (message) => {
        emitToast('error', message);
        cleanUpSideEffects();
      },
      () => {
        openLayerMap.zoomToFit(newLayer.layerId);
        cleanUpSideEffects();
      }
    );
  }
  function cleanUpSideEffects() {
    dispatch(updateLoadingState(false));
  }
  function getCookieValue(cname: string) {
    const cookies = document.cookie.split(';');
    let returnVal;
    for (const cookie of cookies) {
      if (!cookie) continue;
      const cookieKey = cookie.split('=')[0].trim();
      const cookieValue = cookie.split('=')[1].trim();
      if (cookieKey === cname) {
        returnVal = cookieValue;
      }
    }
    return returnVal;
  }
  function handleFileDrop(event: React.DragEvent) {
    event.preventDefault();
    if (event.dataTransfer.files) {
      const files = event.dataTransfer.files;
      dispatch(updateLoadingState(true));
      for (const file of files) {
        const nameSplit = file.name.split('.');
        const type = nameSplit[nameSplit.length - 1];
        if (type === 'json' || type === 'geojson') {
          const fr = new FileReader();
          fr.readAsText(file);
          fr.onload = () => {
            const output = fr.result as string;
            const parsedData = JSON.parse(output) as GeoJsonObj;
            nameSplit.pop();
            const fileName = nameSplit.join();
            plotGeojsonData(parsedData, fileName);
            dispatch(updateLoadingState(false));
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
        newLayer.layerColor,
        newLayer.style
      );
      openLayerMap.zoomToFit(newLayer.layerId);
      dispatch(addUserLayer(newLayer));
    } catch (error) {
      emitToast('error', 'Invalid file format');
      dispatch(updateLoadingState(false));
    }
  }
  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
  }
  return (
    <section
      onDrop={handleFileDrop}
      onDragOver={handleDragOver}
      className={styles.container}
    >
      <div id="ol-map" className={styles.ol_map}></div>
      <>
        <Intro />
        <Popup />
        <Header profileData={profileData} resourceList={allResrources} />
        <LayerCard />
      </>
    </section>
  );
}
export default Canvas;
