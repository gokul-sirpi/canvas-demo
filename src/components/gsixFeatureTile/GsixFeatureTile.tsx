import { FaLock, FaUnlock } from 'react-icons/fa';
import styles from './styles.module.css';
import { RiInformationFill } from 'react-icons/ri';
import { AiFillPlusCircle } from 'react-icons/ai';
import { QueryParams, Resource } from '../../types/resource';
import openLayerMap from '../../lib/openLayers';
import { SetStateAction, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addGsixLayer } from '../../context/gsixLayers/gsixLayerSlice';
import envurls from '../../utils/config';
import TooltipWrapper from '../tooltipWrapper/TooltipWrapper';
import { updateLoadingState } from '../../context/loading/LoaderSlice';
import { emitToast } from '../../lib/toastEmitter';
import { MdDownloadForOffline } from 'react-icons/md';
import { getAllUgixFeatures } from '../../lib/getAllUgixFeatures';

function GsixFeatureTile({
  resource,
  dialogCloseTrigger,
  plotted,
}: {
  resource: Resource;
  dialogCloseTrigger: React.Dispatch<SetStateAction<boolean>>;
  plotted: boolean;
}) {
  const limit = 5;
  const dispatch = useDispatch();
  const [noAccess, setNoAccess] = useState(false);
  const [adding, setAdding] = useState(false);

  function getinfoLink() {
    const groupId = resource.resourceGroup;
    const path = envurls.ugixCatalogue + 'dataset/' + groupId;
    return path;
  }
  function handleInfoOpen() {
    const path = getinfoLink();
    window.open(path, '_blank');
  }

  async function handleGsixLayerAddition() {
    setAdding(true);
    dispatch(updateLoadingState(true));
    const newLayer = openLayerMap.createNewUgixLayer(
      resource.label,
      resource.id
    );
    const queryParams: QueryParams = {
      limit: limit,
      offset: 1,
    };
    getAllUgixFeatures(
      resource,
      newLayer,
      queryParams,
      () => {
        dispatch(addGsixLayer(newLayer));
        // cleanUpSideEffects();
      },
      (message) => {
        emitToast('error', message);
        cleanUpSideEffects();
        setNoAccess(true);
      },
      () => {
        cleanUpSideEffects();
        dialogCloseTrigger(false);
        openLayerMap.zoomToFit(newLayer.layerId);
      }
    );
  }
  function cleanUpSideEffects() {
    setAdding(false);
    dispatch(updateLoadingState(false));
  }
  return (
    <div className={styles.tile_container}>
      {/* content */}
      <div className={styles.tile_description_container}>
        {/* <div className={styles.tile_img_container}>
          <img src={soiImg} alt="Survey Of India" className={styles.soi_img} />
        </div> */}
        <TooltipWrapper content={resource.label}>
          <div className={styles.title_container}>
            <h2 className={styles.tile_title}>{resource.label}</h2>
          </div>
        </TooltipWrapper>
        {resource.accessPolicy === 'OPEN' ? (
          <div className={styles.badge}>
            <FaUnlock /> Public
          </div>
        ) : (
          <div className={`${styles.badge} ${styles.badge_private}`}>
            <FaLock /> Private
          </div>
        )}
      </div>
      {/* icon container */}
      <div className={styles.icon_container}>
        <TooltipWrapper content="add">
          <button
            disabled={plotted || adding}
            onClick={handleGsixLayerAddition}
          >
            <div className={styles.add_icon}>
              <AiFillPlusCircle />
            </div>
          </button>
        </TooltipWrapper>
        <TooltipWrapper content="download">
          <button>
            <div className={styles.add_icon}>
              <MdDownloadForOffline />
            </div>
          </button>
        </TooltipWrapper>
        <TooltipWrapper content="info">
          <button onClick={handleInfoOpen}>
            <div className={styles.add_icon}>
              <RiInformationFill />
            </div>
          </button>
        </TooltipWrapper>
      </div>
      {noAccess && (
        <div className={styles.warn_text}>
          You do not have access to view this data, please visit{' '}
          <a href={getinfoLink()} target="_blank">
            UGIX page
          </a>{' '}
          to request access
        </div>
      )}
    </div>
  );
}

export default GsixFeatureTile;
