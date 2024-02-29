import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers.ts';
import Header from '../../layouts/header/Header';
import LayerCard from '../../layouts/layerCard/LayerCard';
import { UserProfile } from '../../types/UserProfile.ts';
import { useDispatch } from 'react-redux';
import { updateLoadingState } from '../../context/loading/LoaderSlice.ts';
import { axiosAuthClient } from '../../lib/axiosConfig.ts';
import axios from 'axios';
import envurls from '../../utils/config.ts';
import { GeoJsonObj } from '../../types/GeojsonType.ts';
import { Resource } from '../../types/resource.ts';
import { addGsixLayer } from '../../context/gsixLayers/gsixLayerSlice.ts';
import { addUserLayer } from '../../context/userLayers/userLayerSlice.ts';
import { emitToast } from '../../lib/toastEmitter.ts';

function Canvas({ profileData }: { profileData: UserProfile | undefined }) {
  const singleRender = useRef(false);
  const [allResrources, setAllResources] = useState<Resource[]>([]);
  const limit = 900;
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
      const parsedList = JSON.parse(wishList);
      if (Array.isArray(parsedList)) {
        for (const id of parsedList) {
          for (const resource of resourceList)
            if (resource.id === id) {
              handleGsixLayerAddition(resource);
              continue;
            }
        }
      }
    }
  }
  async function handleGsixLayerAddition(resource: Resource) {
    dispatch(updateLoadingState(true));
    try {
      const body = {
        itemId: resource.id,
        itemType: 'resource',
        role: 'consumer',
      };
      if (resource.accessPolicy === 'OPEN') {
        body.itemId = 'rs.iudx.io';
        body.itemType = 'resource_server';
      }
      const response = await axiosAuthClient.post('v1/token', body);
      if (response.status === 200) {
        if (response.data.title === 'Token created') {
          getGsixLayerData(response.data.results.accessToken, resource);
        }
      }
    } catch (error) {
      console.log(error);
      cleanUpSideEffects();
    }
  }
  async function getGsixLayerData(accessToken: string, resource: Resource) {
    try {
      const url = envurls.ugixOgcServer + resource.id + '/items';
      const queryParams = {
        f: 'json',
        offset: 1,
        limit: limit,
      };
      const response = await axios.get(url, {
        headers: { Token: accessToken },
        params: queryParams,
      });
      if (response.status === 200) {
        const geoJsonData: GeoJsonObj = response.data.results;
        plotGsixLayerData(geoJsonData, resource);
      }
    } catch (error) {
      console.log(error);
    } finally {
      cleanUpSideEffects();
    }
  }
  function plotGsixLayerData(data: GeoJsonObj, resource: Resource) {
    const newLayer = openLayerMap.createNewUgixLayer(
      resource.label,
      resource.id
    );
    openLayerMap.addGeoJsonFeature(data, newLayer.layerId, newLayer.layerColor);
    openLayerMap.zoomToFit(newLayer.layerId);
    dispatch(addGsixLayer(newLayer));
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
    openLayerMap.addGeoJsonFeature(data, newLayer.layerId, newLayer.layerColor);
    openLayerMap.zoomToFit(newLayer.layerId);
    dispatch(addUserLayer(newLayer));
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
        <Header profileData={profileData} resourceList={allResrources} />
        <LayerCard />
      </>
    </section>
  );
}
export default Canvas;
