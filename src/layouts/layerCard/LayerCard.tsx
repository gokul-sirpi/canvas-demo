import { useRef } from 'react';
import styles from './styles.module.css';
//
function LayerCard() {
  const dialogref = useRef<HTMLDialogElement>(null);
  function handleOpenDialog() {
    dialogref.current?.showModal();
  }
  function handleCloseDialog() {
    dialogref.current?.showModal();
  }
  return (
    <section className={styles.container}>
      <div>
        <button onClick={handleOpenDialog} className={styles.browse_btn}>
          Browse Data
        </button>
        <dialog ref={dialogref}>
          <div>Explore features</div>
          <div>
            <button onClick={handleCloseDialog}>Close</button>
          </div>
        </dialog>
      </div>
    </section>
  );
}

export default LayerCard;
