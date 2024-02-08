import * as Dialog from '@radix-ui/react-dialog';
import { SetStateAction, useEffect, useState } from 'react';
import styles from './styles.module.css';
import { BsArrowRight } from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';
import { FaSearch } from 'react-icons/fa';
import GsixFeatureTile from '../../components/gsixFeatureTile/GsixFeatureTile';
import { Resource } from '../../types/resource';
import { useSelector } from 'react-redux';
import { RootState } from '../../context/store';
import axios from 'axios';

function BrowseDataDialog({
  isDialogOpen,
  setIsDialogOpen,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  const [searchInput, setSearchInput] = useState<string>('');
  const [allResrources, setAllResources] = useState<Resource[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const plottedLayers = useSelector((state: RootState) => {
    return state.gsixLayer.layers;
  });

  useEffect(() => {
    isDialogOpen === true && getResourceData();
  }, [isDialogOpen]);

  async function getResourceData() {
    const result = await axios.get(
      'https://iudx.s3.ap-south-1.amazonaws.com/resources.json'
    );
    if (result.status === 200 && result.data.length !== 0) {
      const sortedResources = sortResources(result.data);
      setAllResources(sortedResources);
      setResources(sortedResources);
    }
  }

  function sortResources(allResrources: Resource[]) {
    return allResrources.sort((a, b) => {
      if (a.label < b.label) {
        return -1;
      } else if (a.label > b.label) {
        return 1;
      }
      return 0;
    });
  }

  function resetDialogState() {
    setSearchInput('');
    setResources([]);
    setAllResources([]);
  }

  function handleChange(text: string) {
    setSearchInput(text);
    if (text != '') {
      const filteredResources = allResrources.filter((resource) => {
        if (resource.label.toLowerCase().includes(text.toLowerCase())) {
          return resource;
        }
        return;
      });
      const sortedResources = sortResources(filteredResources);
      setResources(sortedResources);
    } else {
      setResources(allResrources);
    }
  }

  return (
    <Dialog.Root open={isDialogOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialog_overlay} />
        <Dialog.Content className={styles.dialog_content}>
          <Dialog.Title className={styles.dialog_title}>
            <button
              className={styles.close_btn}
              onClick={() => {
                resetDialogState();
                setIsDialogOpen(false);
              }}
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
              onChange={(e) => handleChange(e.target.value)}
            />

            <button>
              <div className={styles.btn_icon_container}>
                <BsArrowRight style={{ fontSize: '1.5rem' }} />
              </div>
            </button>
          </Dialog.Description>
          <div className={styles.feature_tile_container}>
            {resources.length > 0 ? (
              resources.map((resource) => {
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
              })
            ) : (
              <div className={styles.error_container}>
                {searchInput !== '' ? (
                  <h4>No matching projects</h4>
                ) : (
                  <h4>No projects found!</h4>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default BrowseDataDialog;
