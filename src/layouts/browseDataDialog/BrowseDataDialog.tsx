import * as Dialog from '@radix-ui/react-dialog';
import { SetStateAction, useEffect, useState } from 'react';
import styles from './styles.module.css';
import { BsArrowRight } from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';
import { FaSearch } from 'react-icons/fa';
import GsixFeatureTile from '../../components/gsixFeatureTile/GsixFeatureTile';
import resourceList from '../../data/resources.json';
import { Resource } from '../../types/resource';
import { useSelector } from 'react-redux';
import { RootState } from '../../context/store';

function BrowseDataDialog({
  isDialogOpen,
  setIsDialogOpen,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  const [searchInput, setSearchInput] = useState<string>('');
  const [resources, setResources] = useState<Resource[]>([]);
  const plottedLayers = useSelector((state: RootState) => {
    return state.gsixLayer.layers;
  });

  useEffect(() => {
    getResourceData();
  }, []);

  function getResourceData() {
    //@ts-expect-error till api is done
    const allresource = resourceList as Resource[];
    const sortedResources = allresource.sort((a, b) => {
      const nameA = a.label.toLowerCase();
      const nameB = b.label.toLowerCase();
      if (nameA < nameB)
        return -1;
      if (nameA > nameB) return 1;
      return 0; 
    });
    setResources(sortedResources);
  }


  return (
    <Dialog.Root open={isDialogOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialog_overlay} />
        <Dialog.Content className={styles.dialog_content}>
          <Dialog.Title className={styles.dialog_title}>
            <button
              className={styles.close_btn}
              onClick={() => setIsDialogOpen(false)}
            >
              <div className={styles.btn_icon_container}>
                <IoMdClose size={20} onClick={() => setIsDialogOpen(false)} />
              </div>
            </button>
          </Dialog.Title>
          <Dialog.Description className={styles.dialog_description}>
            <FaSearch className={styles.search_icon} />
            <input
              type="text"
              placeholder="Explore data sets"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />

            <button>
              <div className={styles.btn_icon_container}>
                <BsArrowRight style={{ fontSize: '1.5rem' }} />
              </div>
            </button>
          </Dialog.Description>
          <div className={styles.feature_tile_container}>
            {resources.map((resource) => {
              const matched = plottedLayers.filter(
                (layer) => layer.gsixLayerId === resource.id
              );
              const plotted = matched.length > 0;
              return (
                <GsixFeatureTile
                  plotted={plotted}
                  key={resource._id}
                  resource={resource}
                  dialogCloseTrigger={setIsDialogOpen}
                />
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default BrowseDataDialog;
