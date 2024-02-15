import { GoCircle } from 'react-icons/go';
import { IoSquareOutline } from 'react-icons/io5';
import { SlLocationPin } from 'react-icons/sl';
//
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers';
import { useDispatch } from 'react-redux';
import { addUserLayer } from '../../context/userLayers/userLayerSlice';
import { drawType } from '../../types/UserLayer';

function DrawingTool({ toolType }: { toolType: drawType }) {
  //   const [createLayerDialog, setCreateLayerDialog] = useState(false);
  const dispatch = useDispatch();
  function drawFeature(type: drawType) {
    const { source, ...newLayer } = openLayerMap.createNewLayer('', type);
    let firstLayer = true;
    if (type === 'Marker') {
      openLayerMap.addMarkerFeature(source, () => {
        if (firstLayer) {
          dispatch(addUserLayer(newLayer));
        }
        firstLayer = false;
      });
    } else {
      openLayerMap.addDrawFeature(type, source, () => {
        if (firstLayer) {
          dispatch(addUserLayer(newLayer));
        }
        firstLayer = false;
      });
    }
  }
  return (
    <>
      {toolType === 'Circle' && (
        <button onClick={() => drawFeature('Circle')}>
          <div className={styles.btn_icon_container}>
            <GoCircle size={25} />
          </div>
        </button>
      )}
      {toolType === 'Box' && (
        <button onClick={() => drawFeature('Box')}>
          <div className={styles.btn_icon_container}>
            <IoSquareOutline size={25} />
          </div>
        </button>
      )}
      {toolType === 'Marker' && (
        <button onClick={() => drawFeature('Marker')}>
          <div className={styles.btn_icon_container}>
            <SlLocationPin size={25} />
          </div>
        </button>
      )}
    </>
  );
}

export default DrawingTool;
