//
import styles from './styles.module.css';

function Loader() {
  return (
    <div className={styles.loader}>
      <div className={styles.blade}></div>
      <div className={styles.blade}></div>
      <div className={styles.blade}></div>
      <div className={styles.blade}></div>
      <div className={styles.blade}></div>
      <div className={styles.blade}></div>
      <div className={styles.blade}></div>
      <div className={styles.blade}></div>
    </div>
  );
}

export default Loader;
