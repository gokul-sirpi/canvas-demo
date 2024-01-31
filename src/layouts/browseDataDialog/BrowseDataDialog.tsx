import * as Dialog from '@radix-ui/react-dialog';
import { SetStateAction } from 'react';
import styles from './styles.module.css';
import { BsArrowRight } from 'react-icons/bs';

function BrowseDataDialog({
  isDialogOpen,
  setIsDialogOpen,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  console.log(isDialogOpen);
  return (
    <Dialog.Root open={isDialogOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialog_overlay} />
        <Dialog.Content className={styles.dialog_content}>
          <Dialog.Title className={styles.dialog_title}>
            <input type="text" placeholder="Explore data sets" />
            <button>
              <BsArrowRight />
            </button>
          </Dialog.Title>
          <div className={styles.feature_tile_container}>
            {/* For Feature tile */}
          </div>
          {/* <div className={styles.dialog_footer}>
    <button>Cancel</button>
           </div> */}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default BrowseDataDialog;
