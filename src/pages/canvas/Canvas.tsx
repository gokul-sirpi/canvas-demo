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
import getResourceServerRegURL from '../../utils/ResourceServerRegURL';

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
  const [allResources, setAllResources] = useState<Resource[]>([]);
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
    // const url = 'cat/v1/search?property=[type]&value=[[iudx:Resource]]';
    const url =
      keycloakEnv.realm === 'adex'
        ? 'cat/v1/search?property=[resourceType]&value=[[OGC]]&'
        : 'cat/v1/search?property=[type]&value=[[iudx:Resource]]';

    try {
      const response = await axios.get(`${envurls.ugixServer}${url}`);

      if (response.status === 200 && response.data.results.length > 0) {
        const featureResources = response.data.results.filter(
          (resource: Resource) =>
            resource.ogcResourceInfo.ogcResourceAPIs.includes('FEATURES')
        );

        const resources =
          keycloakEnv.realm === 'adex'
            ? featureResources
            : response.data.results;

        // Extract unique provider and resourceGroup IDs
        const uniqueProviderIds = [
          ...new Set(resources.map((resource: Resource) => resource.provider)),
        ];
        const uniqueResourceGroups = [
          ...new Set(
            resources.map((resource: Resource) => resource.resourceGroup)
          ),
        ];

        // Fetch provider names
        const providerNames = await Promise.all(
          uniqueProviderIds.map(async (providerId) => {
            try {
              const providerResponse = await axios.get(
                `${envurls.ugixServer}cat/v1/item?id=${providerId}`
              );
              return {
                providerId,
                providerName: providerResponse.data.results[0].description,
              };
            } catch (error) {
              console.error(
                `Error fetching provider name for ID: ${providerId}`,
                error
              );
              return { providerId, providerName: 'Unknown' };
            }
          })
        );

        // Fetch resource details
        const resourceDetails = await Promise.all(
          uniqueResourceGroups.map(async (resourceGroupId) => {
            try {
              const resourceResponse = await axios.get(
                `${envurls.ugixServer}cat/v1/item?id=${resourceGroupId}`
              );
              return {
                resourceGroupId,
                resourceLabel: resourceResponse.data.results[0].label,
                resourceDescription:
                  resourceResponse.data.results[0].description,
              };
            } catch (error) {
              console.error(
                `Error fetching resource details for ID: ${resourceGroupId}`,
                error
              );
              return {
                resourceGroupId,
                resourceLabel: 'Unknown',
                resourceDescription: 'Unknown',
              };
            }
          })
        );

        // Map provider names and resource details to dictionaries for quick lookup
        const providerNameMap = providerNames.reduce(
          (acc, { providerId, providerName }) => {
            acc[providerId as string] = providerName;
            return acc;
          },
          {} as Record<string, string>
        );

        const resourceDetailMap = resourceDetails.reduce(
          (acc, { resourceGroupId, resourceLabel, resourceDescription }) => {
            acc[resourceGroupId as string] = {
              resourceLabel,
              resourceDescription,
            };
            return acc;
          },
          {} as Record<
            string,
            { resourceLabel: string; resourceDescription: string }
          >
        );

        // Update allResources with providerName, resourceLabel, and resourceDescription
        const updatedResources = resources.map((resource: Resource) => ({
          ...resource,
          providerName: providerNameMap[resource.provider] || 'Unknown',
          resourceLabel:
            resourceDetailMap[resource.resourceGroup]?.resourceLabel ||
            'Unknown',
          resourceDescription:
            resourceDetailMap[resource.resourceGroup]?.resourceDescription ||
            'Unknown',
        }));

        setAllResources(updatedResources);
        renderWishListItems(updatedResources);
      } else {
        console.log('No resources found.');
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  }

  console.log(allResources);

  async function renderWishListItems(resourceList: Resource[]) {
    const wishList = getCookieValue(envurls.catalogueCookie);
    if (wishList) {
      const parsedList = wishList.split(',');
      if (Array.isArray(parsedList)) {
        for (const id of parsedList) {
          for (const resource of resourceList) {
            if (resource.id === id) {
              handleUgixLayerAddition(resource);
            }
          }
        }
      }
    }
  }

  async function handleUgixLayerAddition(resource: Resource) {
    dispatch(updateLoadingState(true));
    let serverUrl = await getResourceServerRegURL(resource);

    console.log(serverUrl);
    const newLayer = openLayerMap.createNewUgixLayer(
      serverUrl,
      resource.label,
      resource.id,
      resource.resourceGroup,
      resource.ogcResourceInfo.geometryType
    );
    const queryParams: QueryParams = {
      offset: 1,
    };
    getAllUgixFeatures(
      serverUrl,
      resource,
      newLayer,
      queryParams,
      () => {
        dispatch(addCanvasLayer(newLayer));
        openLayerMap.zoomToCombinedExtend([newLayer.layerId]);
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarContent, setSidebarContent] = useState<any>(null);

  useEffect(() => {
    // Initialize the map click event and pass setSidebarOpen, setSidebarContent
    openLayerMap.initialiseMapClickEvent(setIsSidebarOpen, setSidebarContent);
  }, []);

  return (
    <section className={styles.container}>
      <div className={styles.ol_map_container}>
        <div id="ol-map" className={styles.ol_map}></div>
        <>
          <SwipeLine />
          <Header
            profileData={profileData}
            changePage={changePage}
            currentPage={currentPage}
            resourceList={allResources}
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
