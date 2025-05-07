import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState, useCallback, useMemo } from 'react';
import styles from './styles.module.css';
import { BsArrowRight } from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';
import { FaSearch } from 'react-icons/fa';
import UgixFeatureTile from '../../components/ugixFeatureTile/UgixFeatureTile';
import { Resource } from '../../types/resource';
import Loader from '../../components/loader/Loader';
import { TbWorldSearch } from 'react-icons/tb';
import { debounce, set } from 'lodash';
import openLayerMap from '../../lib/openLayers';
import { useDispatch } from 'react-redux';
import { addCanvasLayer } from '../../context/canvasLayers/canvasLayerSlice';

function BrowseDataDialog({ resourceList }: { resourceList: Resource[] }) {
  const [searchInput, setSearchInput] = useState<string>('');
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  //@ts-ignore
  const [loading, setLoading] = useState<boolean>(false);
  const [visibleResources, setVisibleResources] = useState<number>(50);
  const [showLoadMore, setShowLoadMore] = useState<boolean>(false);

  const sortResources = useMemo(() => {
    return [...resourceList].sort((a, b) => a.label.localeCompare(b.label));
  }, [resourceList]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (isDialogOpen) {
      setTimeout(() => {
        const sortedData = sortResources;
        setAllResources(sortedData);
        setResources(sortedData);
      }, 1000);
    }
  }, [isDialogOpen, resourceList, sortResources]);

  useEffect(() => {
    setShowLoadMore(visibleResources < resources.length);
  }, [visibleResources, resources]);

  const resetDialogState = () => {
    setSearchInput('');
    setResources(allResources);
    setVisibleResources(50);
    setIsDialogOpen(false);
  };

  const handleChange = useCallback(
    debounce((text: string) => {
      if (text !== '') {
        const filteredResources = allResources.filter((resource) => {
          return (
            resource.label.toLowerCase().includes(text.toLowerCase()) ||
            resource.description.toLowerCase().includes(text.toLowerCase()) ||
            resource.tags.some((tag) =>
              tag.toLowerCase().includes(text.toLowerCase())
            ) ||
            (resource.providerName &&
              resource.providerName
                .toLowerCase()
                .includes(text.toLowerCase())) ||
            (resource.resourceLabel &&
              resource.resourceLabel
                .toLowerCase()
                .includes(text.toLowerCase())) ||
            (resource.resourceDescription &&
              resource.resourceDescription
                .toLowerCase()
                .includes(text.toLowerCase()))
          );
        });
        setResources(filteredResources);
        setVisibleResources(50);
      } else {
        setResources(allResources);
        setVisibleResources(50);
      }
    }, 1000),
    [allResources]
  );

  const loadMore = () => {
    setVisibleResources((prev) => Math.min(prev + 50, resources.length));
  };

  // const handleBboxSelection = () => {
  //   setIsDialogOpen(false);
  //   const bboxLayer = openLayerMap.createNewUserLayer(
  //     'bbox-drawer',
  //     'Rectangle'
  //   );
  //   openLayerMap.addDrawFeature('Rectangle', bboxLayer, (event) => {
  //     openLayerMap.removeDrawInteraction();
  //     openLayerMap.removeLayer(bboxLayer.layerId);
  //     const extent = event.feature.getGeometry()?.getExtent();
  //     if (extent) {
  //       getIntersectingResources(extent);
  //     }
  //     setIsDialogOpen(true);
  //   });
  // };

  // const getIntersectingResources = (extent: Extent) => {
  //   const filtered = allResources.filter((resource) => {
  //     const coordinate = resource.location.geometry.coordinates[0];
  //     const localMin = [...coordinate[0]];
  //     const localMax = [...coordinate[0]];
  //     for (let i = 0; i < coordinate.length; i++) {
  //       const element = coordinate[i];
  //       if (element[0] < localMin[0]) localMin[0] = element[0];
  //       if (element[1] < localMin[1]) localMin[1] = element[1];
  //       if (element[0] > localMax[0]) localMax[0] = element[0];
  //       if (element[1] > localMax[1]) localMax[1] = element[1];
  //     }
  //     return !(
  //       localMin[0] > extent[2] ||
  //       localMax[0] < extent[0] ||
  //       localMin[1] > extent[3] ||
  //       localMax[1] < extent[1]
  //     );
  //   });
  //   setResources(filtered);
  // };
  // function PlotStac() {
  //   let url =
  //     'https://s3.us-west-2.amazonaws.com/sentinel-cogs/sentinel-s2-l2a-cogs/10/T/ES/2022/7/S2A_10TES_20220726_0_L2A/S2A_10TES_20220726_0_L2A.json';
  //   const stac = openLayerMap.createNewStacLayer(url);
  //   dispatch(addCanvasLayer(stac));
  //   setIsDialogOpen(false);
  // }
  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Dialog.Trigger asChild>
        <button className="header_button" autoFocus>
          <div>
            <TbWorldSearch size={25} />
          </div>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialog_overlay} />
        <Dialog.Content className={styles.dialog_content}>
          <Dialog.Title className={styles.dialog_title}>
            <button className={styles.close_btn} onClick={resetDialogState}>
              <div className={styles.btn_icon_container}>
                <IoMdClose size={20} />
              </div>
            </button>
          </Dialog.Title>
          <section className={styles.dialog_description}>
            <div className={styles.input_container}>
              <FaSearch className={styles.search_icon} />
              <input
                type="text"
                autoFocus
                placeholder="Explore datasets"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  handleChange(e.target.value);
                }}
              />
              <button>
                <div className={styles.btn_icon_container}>
                  <BsArrowRight style={{ fontSize: '1.5rem' }} />
                </div>
              </button>
            </div>
          </section>

          <div className={styles.feature_tile_container}>
            {/* <button onClick={PlotStac}>Add Stac</button> */}
            {loading ? (
              <div className={styles.loading_container}>
                <Loader />
              </div>
            ) : resources.length > 0 ? (
              <>
                {resources.slice(0, visibleResources).map((resource) => (
                  <UgixFeatureTile
                    key={resource.id}
                    resource={resource}
                    dialogCloseTrigger={setIsDialogOpen}
                  />
                ))}
                {showLoadMore && visibleResources < resources.length && (
                  <button className={styles.load_more_btn} onClick={loadMore}>
                    Load More
                  </button>
                )}
              </>
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
