import styles from './styles.module.css';
import LayerTile from '../../components/layerTile/LayerTile';
import { useSelector } from 'react-redux';
import { RootState } from '../../context/store';
//
function LayerCard() {
  const userLayers = useSelector((state: RootState) => {
    return state.userLayer.layers;
  });
  const gsixLayers = useSelector((state: RootState) => {
    return state.gsixLayer.layers;
  });
  return (
    <section className={styles.container}>
      <div className={styles.user_layer_container}>
        <h2>GSIX Layers</h2>
        <div className={styles.layer_container}>
          {gsixLayers.map((layer, index) => {
            return (
              <LayerTile key={layer.layerId} layer={layer} index={index} />
            );
          })}
        </div>
      </div>
      <div className={styles.user_layer_container}>
        <h2>User layers</h2>
        <div className={styles.layer_container}>
          {userLayers.map((layer, index) => {
            return (
              <LayerTile key={layer.layerId} layer={layer} index={index} />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default LayerCard;
