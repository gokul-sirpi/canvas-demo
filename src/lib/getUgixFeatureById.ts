import axios, { AxiosError } from 'axios';
import { GeoJsonObj } from '../types/GeojsonType';
import { Resource } from '../types/resource';
import envurls from '../utils/config';
import { getAccessToken } from './getAllUgixFeatures';

type UgixLinks = {
  href: string;
  rel: 'alternate' | 'next' | 'self';
  type: string;
};

export async function getUgixFeatureById(
  ugixId: string
): Promise<GeoJsonObj[]> {
  const resource: Resource = JSON.parse(
    sessionStorage.getItem(`${ugixId}-ugix-resource`)!
  );

  if (!resource) {
    throw new Error('No resource found');
  }

  const { error, token } = await getAccessToken(resource);
  if (error) {
    throw new Error(`no-access: ${error}`);
  }

  if (!token) {
    throw new Error('Unable to get access token');
  }

  let totalFeaturesReturned = 0;
  let totalFeatures = Infinity;
  let currFeaturesReturned = Infinity;
  let url = `${envurls.ugixOgcServer}collections/${ugixId}/items?offset=1`;
  let allGeoJsonData: GeoJsonObj = {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326',
      },
    },
    features: [],
  };

  do {
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const geojsonData = response.data;
        if (geojsonData.numberMatched === 0) {
          throw new Error('empty');
        }

        allGeoJsonData.features.push(...geojsonData.features);

        const links: UgixLinks[] = geojsonData.links;
        const nextLink = links.find((link) => link.rel === 'next');
        if (nextLink) {
          url = nextLink.href;
        } else {
          break;
        }

        totalFeatures = Math.min(totalFeatures, geojsonData.numberMatched);
        totalFeaturesReturned += geojsonData.numberReturned;
        currFeaturesReturned = geojsonData.numberReturned;
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 403) {
          throw new Error(`no-access: ${error.message}`);
        } else {
          throw new Error(`unknown: ${error.message}`);
        }
      } else {
        throw new Error(
          `unknown: ${error instanceof Error ? error.message : 'Something went wrong'}`
        );
      }
    }
  } while (totalFeaturesReturned < totalFeatures && currFeaturesReturned > 0);

  // @ts-ignore
  return allGeoJsonData;
}
