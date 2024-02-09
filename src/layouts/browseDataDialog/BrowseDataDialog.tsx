import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import styles from './styles.module.css';
import { BsArrowRight } from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';
import { FaSearch } from 'react-icons/fa';
import GsixFeatureTile from '../../components/gsixFeatureTile/GsixFeatureTile';
import { Resource } from '../../types/resource';
import { useSelector } from 'react-redux';
import { RootState } from '../../context/store';
import { PiSelection } from 'react-icons/pi';
import axios from 'axios';
import openLayerMap from '../../lib/openLayers';
import { TbWorldSearch } from 'react-icons/tb';
import { Extent } from 'ol/extent';
import TooltipWrapper from '../../components/tooltipWrapper/TooltipWrapper';

function BrowseDataDialog() {
  const [searchInput, setSearchInput] = useState<string>('');
  const [allResrources, setAllResources] = useState<Resource[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const plottedLayers = useSelector((state: RootState) => {
    return state.gsixLayer.layers;
  });

  useEffect(() => {
    if (isDialogOpen === true) {
      if (allResrources.length === 0) {
        getResourceData();
      }
    }
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
    setResources(allResrources);
    setIsDialogOpen(false);
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
      setResources(filteredResources);
    } else {
      setResources(allResrources);
    }
  }

  function handleBboxSelection() {
    setIsDialogOpen(false);
    const bboxLayer = openLayerMap.createNewLayer('bbox-drawer');
    openLayerMap.addDrawFeature('Box', bboxLayer.source, (event) => {
      openLayerMap.removeDrawInteraction();
      openLayerMap.removeLayer(bboxLayer.layerId);
      const extent = event.feature.getGeometry()?.getExtent();
      if (extent) {
        getIntersectingResources(extent);
      }
      setIsDialogOpen(true);
    });
  }
  function getIntersectingResources(extent: Extent) {
    const filtered = [];
    for (let i = 0; i < allResrources.length; i++) {
      const resource = allResrources[i];
      const coordinate = resource.location.geometry.coordinates[0];
      const localMin = [...coordinate[0]];
      const localMax = [...coordinate[0]];
      for (let j = 0; j < 4; j++) {
        const element = coordinate[j];
        if (element[0] < localMin[0]) {
          localMin[0] = element[0];
        }
        if (element[1] < localMin[1]) {
          localMin[1] = element[1];
        }
        if (element[0] > localMax[0]) {
          localMax[0] = element[0];
        }
        if (element[1] > localMax[1]) {
          localMax[1] = element[1];
        }
      }
      const bboxMin = [extent[0], extent[1]];
      const bboxMax = [extent[2], extent[3]];
      if (localMin[0] > bboxMax[0] || localMax[0] < bboxMin[0]) {
        continue;
      }
      if (localMin[1] > bboxMax[1] || localMax[1] < bboxMin[1]) {
        continue;
      }
      filtered.push(resource);
    }
    setResources(filtered);
  }

  return (
    <Dialog.Root open={isDialogOpen}>
      <Dialog.Trigger asChild>
        <button autoFocus onClick={() => setIsDialogOpen(true)}>
          <TooltipWrapper content="browse data">
            <div className={styles.btn_icon_container_primary}>
              <TbWorldSearch size={25} />
            </div>
          </TooltipWrapper>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialog_overlay} />
        <Dialog.Content className={styles.dialog_content}>
          <Dialog.Title className={styles.dialog_title}>
            <button className={styles.close_btn} onClick={resetDialogState}>
              <div className={styles.btn_icon_container}>
                <IoMdClose size={20} onClick={() => setIsDialogOpen(false)} />
              </div>
            </button>
          </Dialog.Title>
          <section className={styles.dialog_description}>
            <div className={styles.input_container}>
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
            </div>
            <div className={styles.bbox_btn_container}>
              <button onClick={handleBboxSelection} className={styles.bbox_btn}>
                <div className={styles.btn_icon_container}>
                  <PiSelection size={25} />
                </div>
                <p>Area Search</p>
              </button>
            </div>
          </section>
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
