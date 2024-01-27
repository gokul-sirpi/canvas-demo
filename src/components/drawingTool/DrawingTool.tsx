import { GoCircle } from 'react-icons/go';
import { IoSquareOutline } from 'react-icons/io5';
import { SlLocationPin } from 'react-icons/sl';
//
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers';
import { useDispatch } from 'react-redux';
import { addUserLayer } from '../../context/userLayers/userLayerSlice';

type drawType = 'Circle' | 'Box' | 'Point';
function DrawingTool({ toolType }: { toolType: drawType }) {
  //   const [createLayerDialog, setCreateLayerDialog] = useState(false);
  const dispatch = useDispatch();
  function drawBbox(type: drawType) {
    const { source, ...newLayer } = openLayerMap.createNewLayer('');
    let firstLayer = true;
    if (type === 'Point') {
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
        <button onClick={() => drawBbox('Circle')}>
          <div className={styles.btn_icon_container}>
            <GoCircle size={25} />
          </div>
        </button>
      )}
      {toolType === 'Box' && (
        <button onClick={() => drawBbox('Box')}>
          <div className={styles.btn_icon_container}>
            <IoSquareOutline size={25} />
          </div>
        </button>
      )}
      {toolType === 'Point' && (
        <button onClick={() => drawBbox('Point')}>
          <div className={styles.btn_icon_container}>
            <SlLocationPin size={25} />
          </div>
        </button>
      )}
    </>
  );
}

export default DrawingTool;
