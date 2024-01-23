import ugix_logo from '../../assets/images/logo.png';
import styles from './styles.module.css';
import { Type as geometryType } from 'ol/geom/Geometry';
//
// import DrawingTool from '../drawingTool/DrawingTool';
import { FaRegCircle, FaRegSquare } from 'react-icons/fa';

function Header({ addFeature }: { addFeature: (type: geometryType) => void }) {
  function drawBbox(type: geometryType) {
    addFeature(type);
  }

  return (
    <header className={styles.container}>
      <img src={ugix_logo} className={styles.logo_img} alt="" />
      <div>
        <button onClick={() => drawBbox('Circle')}>
          <FaRegCircle size={30} />
        </button>
        <button onClick={() => drawBbox('Polygon')}>
          <FaRegSquare size={30} />
        </button>
      </div>
      <div>Profile</div>
    </header>
  );
}

export default Header;
