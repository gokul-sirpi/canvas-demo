import { FaLock, FaUnlock } from 'react-icons/fa';
import soiImg from '../../assets/images/soi-logo.png';
import styles from './styles.module.css';
import { RiInformationFill } from 'react-icons/ri';
import { AiFillPlusCircle } from 'react-icons/ai';
import { Resource } from '../../types/resource';
import axios from 'axios';
import openLayerMap from '../../lib/openLayers';
import { GeoJsonObj } from '../../types/GeojsonType';
import { SetStateAction, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addGsixLayer } from '../../context/gsixLayers/gsixLayerSlice';
import { axiosAuthClient } from '../../lib/axiosConfig';
import envurls from '../../utils/config';
import TooltipWrapper from '../tooltipWrapper/TooltipWrapper';

function GsixFeatureTile({
  resource,
  dialogCloseTrigger,
  plotted,
}: {
  resource: Resource;
  dialogCloseTrigger: React.Dispatch<SetStateAction<boolean>>;
  plotted: boolean;
}) {
  const limit = 300;
  const dispatch = useDispatch();
  const [noAccess, setNoAccess] = useState(false);

  function handleInfoOpen() {
    const groupId = resource.id.split('/').slice(0, -1).join('-');
    const path = envurls.gsixCatalogue + 'dataset/' + groupId;
    window.open(path, '_blank');
  }

  async function handleGsixLayerAddition() {
    try {
      const body = {
        itemId: resource.id,
        itemType: 'resource',
        role: 'consumer',
      };
      if (resource.access_status === 'Public') {
        body.itemId = 'rs.iudx.io';
        body.itemType = 'resource_server';
      }
      const response = await axiosAuthClient.post('v1/token', body);
      if (response.status === 200) {
        if (response.data.title === 'Token created') {
          getGsixLayerData(response.data.results.accessToken);
        }
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          setNoAccess(true);
        }
      }
    }
  }
  async function getGsixLayerData(accessToken: string) {
    try {
      const url = envurls.gsixOgcServer + resource.id + '/items';
      const queryParams = {
        f: 'json',
        offset: 1,
        limit: limit,
      };
      const response = await axios.get(url, {
        headers: { Token: accessToken },
        params: queryParams,
      });
      if (response.status === 200) {
        const geoJsonData: GeoJsonObj = response.data.results;
        const layerName = resource.label;
        plotGsixLayerData(geoJsonData, layerName);
        dialogCloseTrigger(false);
      }
    } catch (error) {
      console.log(error);
    }
  }
  function plotGsixLayerData(data: GeoJsonObj, layerName: string) {
    const newLayer = openLayerMap.addGeoJsonFeature(
      data,
      layerName,
      resource.id
    );
    openLayerMap.zoomToFit(resource.location);
    dispatch(addGsixLayer(newLayer));
  }
  return (
    <div className={styles.tile_container}>
      {/* content */}
      <div className={styles.tile_description_container}>
        <div className={styles.tile_img_container}>
          <img src={soiImg} alt="Survey Of India" className={styles.soi_img} />
        </div>
        <div className={styles.title_container}>
          <h2 className={styles.tile_title}>{resource.label}</h2>
        </div>
        {resource.access_status === 'Public' ? (
          <div className={styles.badge}>
            <FaUnlock /> {resource.access_status}
          </div>
        ) : (
          <div className={`${styles.badge} ${styles.badge_private}`}>
            <FaLock /> {resource.access_status}
          </div>
        )}
      </div>
      {/* icon container */}
      <div className={styles.icon_container}>
        <TooltipWrapper content="add">
          <button disabled={plotted} onClick={handleGsixLayerAddition}>
            <div className={styles.add_icon}>
              <AiFillPlusCircle />
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
          <a
            onClick={(e) => {
              e.preventDefault();
              handleInfoOpen();
            }}
            href=""
          >
            gsx page
          </a>{' '}
          to request access
        </div>
      )}
    </div>
  );
}

export default GsixFeatureTile;
