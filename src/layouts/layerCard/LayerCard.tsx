import styles from './styles.module.css';
import LayerTile from '../../components/layerTile/LayerTile';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../context/store';
//
import { FaAngleDoubleLeft } from 'react-icons/fa';
import { useState } from 'react';
import { Reorder } from 'framer-motion';
import { changeCanvasLayer } from '../../context/canvasLayers/canvasLayerSlice';
import { UserLayer } from '../../types/UserLayer';
import { UgixLayer } from '../../types/UgixLayers';
import openLayerMap from '../../lib/openLayers';

function LayerCard() {
  const [isCardOpen, setIsCardOpen] = useState<boolean>(true);
  const dispatch = useDispatch();
  const canvasLayers = useSelector((state: RootState) => {
    return state.userLayer.layers;
  });
  function handleReorder(e: (UserLayer | UgixLayer)[]) {
    dispatch(changeCanvasLayer(e));
    const layerIdArr = e.map((layer) => {
      return layer.layerId;
    });
    openLayerMap.swapLayerPosition(layerIdArr);
  }
  return (
    <section>
      <div className={styles.container}>
        <h3 className={styles.layer_card_heading}>Layers</h3>
        <div data-visible={isCardOpen} className={`${styles.card_container} `}>
          {canvasLayers.length === 0 ? (
            <div className={styles.noData}>No layers avalaible</div>
          ) : (
            <div className={styles.layer_container}>
              <Reorder.Group
                axis="y"
                values={canvasLayers}
                onReorder={handleReorder}
                className={styles.layer_group}
              >
                {canvasLayers.map((layer, index) => {
                  return (
                    <Reorder.Item value={layer} key={layer.layerId}>
                      <LayerTile
                        // key={layer.layerId}
                        layer={layer}
                        index={index}
                      />
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCardOpen(!isCardOpen)}
          className={styles.min_max_container}
        >
          <div data-open={isCardOpen} className={styles.icon_container}>
            <FaAngleDoubleLeft className={styles.min_max_icon} />
          </div>
        </button>
      </div>
    </section>
  );
}

export default LayerCard;
