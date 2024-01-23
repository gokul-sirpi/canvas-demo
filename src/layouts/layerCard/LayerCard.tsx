import styles from './styles.module.css';
import { UserLayer } from '../../types/UserLayer';
//
function LayerCard({ userLayer }: { userLayer: UserLayer[] }) {
  return (
    <section className={styles.container}>
      <div>
        <h4>User Layers</h4>
        <div>
          {userLayer.map((layer) => {
            return <div key={layer.layerId}>{layer.layerName}</div>;
          })}
        </div>
      </div>
    </section>
  );
}

export default LayerCard;
