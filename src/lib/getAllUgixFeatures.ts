import axios, { AxiosError } from 'axios';
import { QueryParams, Resource } from '../types/resource';
import { axiosAuthClient } from './axiosConfig';
import envurls from '../utils/config';
import { UgixLayer } from '../types/UgixLayers';
import { GeoJsonObj } from '../types/GeojsonType';
import openLayerMap from './openLayers';

type onSucess = () => void;
type onError = (message: string) => void;
type onFinished = () => void;

type UgixLinks = {
  href: string;
  rel: 'alternate' | 'next' | 'self';
  type: string;
};
// const limit = 5;

export async function getAllUgixFeatures(
  resource: Resource,
  ugixLayer: UgixLayer,
  params: QueryParams,
  onSucess: onSucess,
  onError: onError,
  onFinished?: onFinished
) {
  const { error, token } = await getAccessToken(resource);
  if (error) {
    onError(error);
    return;
  }
  if (token) {
    let totalFeaturesReturned = 0;
    let totalFeatures = Infinity;
    let currFeaturesReturned = Infinity;
    let url =
      envurls.ugixOgcServer + 'collections/' + resource.id + '/items?offset=1';
    do {
      try {
        const response = await axios.get(url, {
          headers: { Token: token },
          params,
        });
        if (response.status === 200) {
          const geojsonData: GeoJsonObj = response.data;
          openLayerMap.addGeoJsonFeature(
            geojsonData,
            ugixLayer.layerId,
            ugixLayer.style,
            ugixLayer.layerName
          );
          if (totalFeaturesReturned === 0) {
            onSucess();
          }
          const links: UgixLinks[] = response.data.links;
          let nextLinkExist = false;
          links.forEach((link) => {
            if (link.rel === 'next') {
              url = link.href;
              nextLinkExist = true;
            }
          });
          if (!nextLinkExist) {
            break;
          }
          totalFeatures = Math.min(totalFeatures, response.data.numberMatched);
          totalFeaturesReturned += response.data.numberReturned;
          currFeaturesReturned = response.data.numberReturned;
        } else {
          break;
        }
      } catch (error) {
        console.log(error);
        if (error instanceof AxiosError) {
          onError(error.message);
        } else {
          onError('Something went wrong, please try again later');
        }
        break;
      }
    } while (totalFeaturesReturned < totalFeatures && currFeaturesReturned > 0);
    if (onFinished) {
      onFinished();
    }
  }
}

export async function getAccessToken(resource: Resource) {
  try {
    const body = {
      itemId: resource.id,
      itemType: 'resource',
      role: 'consumer',
    };
    if (resource.accessPolicy === 'OPEN') {
      body.itemId = 'geoserver.dx.ugix.org.in';
      body.itemType = 'resource_server';
    }
    const response = await axiosAuthClient.post('v1/token', body);
    if (response.status === 200) {
      return {
        error: null,
        token: response.data.results.accessToken as string,
      };
    }
    return { error: 'Unable to get token', token: null };
  } catch (error) {
    if (error instanceof AxiosError) {
      return { error: error.message, token: null };
    } else {
      return { error: 'Error', token: null };
    }
  }
}
