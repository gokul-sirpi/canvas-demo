import * as Dialog from '@radix-ui/react-dialog';
import { SetStateAction, useState } from 'react';
import styles from './styles.module.css';
import { BsArrowRight } from 'react-icons/bs';
import { IoIosCloseCircle } from 'react-icons/io';
import { FaSearch } from 'react-icons/fa';
import GsixFeatureTile from '../../components/gsixFeatureTile/GsixFeatureTile';

function BrowseDataDialog({
  isDialogOpen,
  setIsDialogOpen,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  const [searchInput, setSearchInput] = useState<string>('');
  return (
    <Dialog.Root open={isDialogOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialog_overlay} />
        <Dialog.Content className={styles.dialog_content}>
          <Dialog.Title className={styles.dialog_title}>
            <IoIosCloseCircle
              onClick={() => setIsDialogOpen(false)}
              className={styles.close_btn}
            />
          </Dialog.Title>
          <Dialog.Description className={styles.dialog_description}>
            <FaSearch className={styles.search_icon}/>
            <input
              type="text"
              placeholder="Explore data sets"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />

            <button>
              <BsArrowRight style={{ fontSize: '1.5rem' }} />
            </button>
          </Dialog.Description>
          <div className={styles.feature_tile_container}>
          <GsixFeatureTile />
          <GsixFeatureTile />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default BrowseDataDialog;
