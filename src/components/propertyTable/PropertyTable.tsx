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
import { GenericObject } from '../../types/GeojsonType';
import { LuSearchX } from 'react-icons/lu';

export default function PropertyTable({
  footerStatus,
}: {
  footerStatus: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const keywordMap = useRef<Map<string, Set<number>>>(new Map());
  const fuseOperator = useRef<Fuse<{ key: string }>>();
  const debounceTimer = useRef<number>();
  //
  const [layerProp, setLayerProp] = useState<GenericObject[]>([]);
  const [filteredProps, setFilteredProps] = useState<GenericObject[]>([]);
  const [currSortKey, setCurrSortKey] = useState('');
  const [currSortBy, setCurrSortBy] = useState<'ASC' | 'DSC'>('ASC');
  const canvasLayer = useSelector((state: RootState) => {
    return state.footerState.canvasLayer;
  });
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
  function getLayerProperties() {
    if (canvasLayer) {
      const layerData = openLayerMap.canvasLayers.get(canvasLayer.layerId);
      if (!layerData) return;
      const layerJsonData = openLayerMap.createGeojsonFromLayer(
        canvasLayer.layerId,
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
          <LuSearchX size={30} />
          <p>No Results</p>
        </div>
      )}
    </section>
  );
}
