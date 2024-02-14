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
    const result = await axios.get(
      'https://iudx.s3.ap-south-1.amazonaws.com/ugix_resources.json'
    );
    if (result.status === 200 && result.data.length !== 0) {
      setAllResources(result.data);
      renderWishListItems(result.data);
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
      if (resource.access_status === 'Public') {
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
    const newLayer = openLayerMap.addGeoJsonFeature(
      data,
      resource.label,
      resource.id
    );
    openLayerMap.zoomToFit(resource.location);
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
  return (
    <section className={styles.container}>
      <div id="ol-map" className={styles.ol_map}></div>
      <>
        <Header profileData={profileData} resourceList={allResrources} />
        <LayerCard />
      </>
    </section>
  );
}
export default Canvas;
