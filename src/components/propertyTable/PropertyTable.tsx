import { ChangeEvent, useEffect, useRef, useState } from 'react';
import IntersectObserver from '../intersectObserver/IntersectObserver';
import { useSelector } from 'react-redux';
import { FaArrowCircleUp, FaSearch } from 'react-icons/fa';
import Fuse from 'fuse.js';
//
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers';
import { emitToast } from '../../lib/toastEmitter';
import { RootState } from '../../context/store';
import { GenericObject, GeoJsonObj } from '../../types/GeojsonType';
import { LuSearchX } from 'react-icons/lu';
import { UgixLayer } from '../../types/UgixLayers';
import { toast } from 'react-toastify';
import { getAccessToken } from '../../lib/getAllUgixFeatures';
import envurls from '../../utils/config';
import axios, { AxiosError } from 'axios';
import { Resource } from '../../types/resource';

type UgixLinks = {
  href: string;
  rel: 'alternate' | 'next' | 'self';
  type: string;
};

export default function PropertyTable({
  footerStatus,
  controller,
}: {
  footerStatus: boolean;
  controller: AbortController;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const keywordMap = useRef<Map<string, Set<number>>>(new Map());
  const fuseOperator = useRef<Fuse<{ key: string }>>();
  const debounceTimer = useRef<number>();

  const [layerProp, setLayerProp] = useState<GenericObject[]>([]);
  const [filteredProps, setFilteredProps] = useState<GenericObject[]>([]);
  const [currSortKey, setCurrSortKey] = useState('');
  const [currSortBy, setCurrSortBy] = useState<'ASC' | 'DSC'>('ASC');
  const canvasLayer = useSelector((state: RootState) => {
    return state.footerState.canvasLayer;
  });

  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (canvasLayer) {
      getLayerProperties();
      if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current?.focus();
      }
      setCurrSortKey('');
    }
  }, [canvasLayer]);

  useEffect(() => {
    if (!footerStatus && inputRef.current) {
      inputRef.current.value = '';
      setFilteredProps(layerProp);
      setCurrSortKey('');
    } else {
      inputRef.current?.focus();
    }
  }, [footerStatus]);

  const [loadedFeatures, setLoadedFeatures] = useState<GeoJsonObj>({
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326',
      },
    },
    features: [],
  });

  useEffect(() => {
    if (loadedFeatures.features.length > 0) {
      const layerProperties = loadedFeatures.features.map((feature) => {
        const { properties } = feature;
        delete properties.geometry;
        delete properties.fill;
        delete properties.stroke;
        delete properties['fill-opacity'];
        delete properties['stroke-width'];
        delete properties['stroke-opacity'];
        delete properties['marker-id'];
        delete properties.layerGeom;
        delete properties.layerId;
        delete properties.layer;
        return properties;
      });

      setLayerProp((prev) => [...prev, ...layerProperties]);
      setFilteredProps((prev) => [...prev, ...layerProperties]);
      setFetchingData(false);
    }
    console.log(loadedFeatures);
  }, [loadedFeatures]);

  useEffect(() => {
    if (layerProp.length > 0) {
      createSearchableData(layerProp);
    }
  }, [layerProp]);

  async function getUgixFeatureById(ugixId: string, toastMessage?: string) {
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

    toast.loading(toastMessage, {
      toastId: 'fetching-data',
      position: 'bottom-right',
      theme: 'dark',
    });

    do {
      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (response.status === 200) {
          const geojsonData = response.data;

          if (geojsonData.numberMatched === 0) {
            throw new Error('empty');
          }

          setLoadedFeatures((prev) => {
            return {
              ...prev,
              features: geojsonData.features,
            };
          });

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
            throw new Error(`${error.message}`);
          }
        } else {
          throw new Error(
            `${error instanceof Error ? error.message : 'Something went wrong'}`
          );
        }
      }
    } while (totalFeaturesReturned < totalFeatures && currFeaturesReturned > 0);
  }

  async function getLayerProperties() {
    setLayerProp([]);
    setFilteredProps([]);
    try {
      if (canvasLayer) {
        let l: UgixLayer = canvasLayer as UgixLayer;
        if (l.sourceType === 'tile') {
          if (!footerStatus || !controller) return;

          setFetchingData(true);
          await getUgixFeatureById(
            l.ugixLayerId,
            'Fetching layer properties...'
          );
        } else {
          const layerData = openLayerMap.canvasLayers.get(canvasLayer.layerId);
          if (!layerData) return;
          const layerJsonData = openLayerMap.createGeojsonFromLayer(
            canvasLayer.layerId,
            // @ts-ignore
            layerData.layer
          );
          if (layerJsonData) {
            const layerProperties = layerJsonData.features.map((feature) => {
              const { properties } = feature;
              delete properties.geometry;
              delete properties.fill;
              delete properties.stroke;
              delete properties['fill-opacity'];
              delete properties['stroke-width'];
              delete properties['stroke-opacity'];
              delete properties['marker-id'];
              delete properties.layerGeom;
              delete properties.layerId;
              delete properties.layer;
              return properties;
            });

            createSearchableData(layerProperties);
            setLayerProp(layerProperties);
            setFilteredProps(layerProperties);
          } else {
            emitToast('error', 'unable to get layer properties');
          }
        }
      }
    } catch (err: any) {
      console.log(err.message);
      if (err.message === 'canceled') {
        console.log('request canceled');
      } else {
        emitToast('error', 'Unable to fetch data');
      }
    } finally {
      setFetchingData(false);
      toast.dismiss('fetching-data');
    }
  }

  function createSearchableData(properties: GenericObject[]) {
    const wordToRowMap = new Map<string, Set<number>>();
    const keyList: { key: string }[] = [];
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      Object.values(property).forEach((value) => {
        if (typeof value === 'string') {
          value = value.toLowerCase();
          if (wordToRowMap.has(value)) {
            wordToRowMap.get(value)?.add(i);
          } else {
            wordToRowMap.set(value, new Set([i]));
            keyList.push({ key: value });
          }
        }
      });
    }
    keywordMap.current = wordToRowMap;
    fuseOperator.current = new Fuse(keyList, {
      keys: ['key'],
      threshold: 0.5,
      includeScore: true,
    });
  }

  function handleFuzzySearch(event: ChangeEvent<HTMLInputElement>) {
    const text = event.target.value;
    if (text === '') {
      setFilteredProps(layerProp);
      return;
    }
    if (keywordMap.current.size === 0) return;
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      const filteredRows = fuzzySearch(text);
      //
      const filtered: GenericObject[] = [];
      if (filteredRows) {
        filteredRows.forEach((value) => {
          filtered.push(layerProp[value]);
        });
      }
      if (currSortKey) {
        columnBasedSort(currSortKey, currSortBy, filtered);
      } else {
        setFilteredProps(filtered);
      }
    }, 500);
  }

  function fuzzySearch(input: string) {
    const unionSet = new Set<number>();
    if (fuseOperator.current) {
      const result = fuseOperator.current.search(input);
      result.forEach((item) => {
        const key = item.item.key;
        keywordMap.current.get(key)?.forEach((value) => {
          unionSet.add(value);
        });
      });
      // });
    }
    return unionSet;
  }

  function handleSort(key: string) {
    setCurrSortKey(key);
    let sortBy: 'ASC' | 'DSC' = 'ASC';
    if (currSortKey === key) {
      if (currSortBy === 'ASC') {
        sortBy = 'DSC';
      } else {
        sortBy = 'ASC';
      }
    }
    setCurrSortBy(sortBy);
    columnBasedSort(key, sortBy, filteredProps);
  }

  function columnBasedSort(
    sortKey: string,
    sortBy: 'ASC' | 'DSC',
    arrayToSort: GenericObject[]
  ) {
    let order = 1;
    if (sortBy === 'DSC') {
      order = -1;
    }
    console.log('sorting');

    const notNull = [];
    const onlyNull = [];
    for (let i = 0; i < arrayToSort.length; i++) {
      if (
        arrayToSort[i][sortKey] === null ||
        arrayToSort[i][sortKey] === undefined
      ) {
        onlyNull.push(arrayToSort[i]);
      } else {
        notNull.push(arrayToSort[i]);
      }
    }
    notNull.sort((a, b) => {
      //@ts-expect-error all null values are already removed
      if (a[sortKey] >= b[sortKey]) {
        return order;
      } else {
        return -order;
      }
    });
    setFilteredProps([...notNull, ...onlyNull]);
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.layer_name} title={canvasLayer?.layerName}>
          {canvasLayer?.layerName}
        </h2>
        <div className={styles.input_container}>
          <input
            ref={inputRef}
            onInput={handleFuzzySearch}
            type="text"
            className={styles.search_input}
          />
          <div className={styles.icon_container}>
            <FaSearch size={18} className={styles.search_icon} />
          </div>
        </div>
      </header>
      {filteredProps.length > 0 ? (
        <div ref={rootRef} className={styles.tb_container}>
          <table className={styles.prop_table}>
            <thead className={styles.tb_thead}>
              <tr className={styles.tb_tr}>
                <th>Sr.No</th>
                {Object.keys(filteredProps[0]).map((prop, index) => {
                  return (
                    <th key={index} className={styles.tb_th}>
                      <p>{prop}</p>
                      <button
                        onClick={() => {
                          handleSort(prop);
                        }}
                        className={styles.sort_btn}
                        data-rotated={
                          currSortKey === prop && currSortBy === 'DSC'
                        }
                      >
                        <FaArrowCircleUp
                          color={currSortKey === prop ? '#565656' : '#d6d6d6'}
                        />
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className={styles.tb_tbody}>
              {filteredProps.map((feature, index) => {
                return (
                  <IntersectObserver
                    key={index}
                    root={rootRef.current}
                    length={Object.keys(feature).length}
                  >
                    {/* <tr key={index} className={styles.tb_tr}> */}
                    <td className={styles.tb_td}>{index + 1}</td>
                    {Object.keys(feature).map((prop, index) => {
                      return (
                        <td
                          data-overflow={`${feature[prop]}`.length > 80}
                          title={`${feature[prop]}`}
                          key={index}
                          className={styles.tb_td}
                        >
                          {feature[prop]}
                        </td>
                      );
                    })}
                    {/* </tr> */}
                  </IntersectObserver>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.no_data}>
          {fetchingData ? (
            <p>Please wait for the results</p>
          ) : (
            <>
              <LuSearchX size={30} />
              <p>No Results</p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
