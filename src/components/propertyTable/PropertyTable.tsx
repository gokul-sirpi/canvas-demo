//
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers';
import { UserLayer } from '../../types/UserLayer';
import { UgixLayer } from '../../types/UgixLayers';
import { emitToast } from '../../lib/toastEmitter';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import IntersectObserver from '../intersectObserver/IntersectObserver';
import { useSelector } from 'react-redux';
import { RootState } from '../../context/store';
import { FaSearch } from 'react-icons/fa';
import { GenericObject } from '../../types/GeojsonType';

export default function PropertyTable() {
  const rootRef = useRef<HTMLDivElement>(null);
  const keywordMap = useRef<Map<string, Set<number>>>(new Map());
  const [layerProp, setLayerProp] = useState<GenericObject[]>([]);
  const [filteredProps, setFilteredProps] = useState<GenericObject[]>([]);
  const canvasLayer = useSelector((state: RootState) => {
    return state.footerState.canvasLayer;
  });
  useEffect(() => {
    if (canvasLayer) {
      getLayerProperties();
    }
  }, [canvasLayer]);
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
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      Object.values(property).forEach((value) => {
        if (typeof value === 'string') {
          value = value.toLowerCase();
          if (wordToRowMap.has(value)) {
            wordToRowMap.get(value)?.add(i);
          } else {
            wordToRowMap.set(value, new Set([i]));
          }
        }
      });
    }
    keywordMap.current = wordToRowMap;
    console.log(wordToRowMap);
  }
  function handleFuzzySearch(event: ChangeEvent<HTMLInputElement>) {
    const text = event.target.value;
    if (keywordMap.current.size === 0) return;
    const filteredRows = fuzzySearch(text);
    //
    const filtered: GenericObject[] = [];
    filteredRows.forEach((value) => {
      filtered.push(layerProp[value]);
    });
    setFilteredProps(filtered);
  }
  function fuzzySearch(input: string) {
    const unionSet = new Set<number>();
    keywordMap.current.forEach((value, key) => {
      if (key.includes(input)) {
        value.forEach((value) => {
          unionSet.add(value);
        });
      }
    });
    return unionSet;
  }
  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.layer_name} title={canvasLayer?.layerName}>
          {canvasLayer?.layerName}
        </h2>
        <div className={styles.input_container}>
          <input
            onInput={handleFuzzySearch}
            type="text"
            className={styles.search_input}
          />
          <div className={styles.icon_container}>
            <FaSearch size={18} className={styles.search_icon} />
          </div>
        </div>
      </header>
      {filteredProps.length > 0 && (
        <div ref={rootRef} className={styles.tb_container}>
          <table className={styles.prop_table}>
            <thead className={styles.tb_thead}>
              <tr className={styles.tb_tr}>
                <th>Sr.No</th>
                {Object.keys(filteredProps[0]).map((prop, index) => {
                  return (
                    <th key={index} className={styles.tb_th}>
                      {prop}
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
      )}
    </section>
  );
}
