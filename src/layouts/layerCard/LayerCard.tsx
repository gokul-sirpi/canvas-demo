import styles from './styles.module.css';
import { UserLayer } from '../../types/UserLayer';
import LayerTile from '../../components/layerTile/LayerTile';
//
function LayerCard({ userLayer }: { userLayer: UserLayer[] }) {
  return (
    <section className={styles.container}>
      <div className={styles.user_layer_container}>
        <h2>User layers</h2>
        <div className={styles.layer_container}>
          {userLayer.map((layer) => {
            return <LayerTile key={layer.layerId} layer={layer} />;
          })}
        </div>
      </div>
    </section>
  );
}

export default LayerCard;
