import ugix_logo from '../../assets/images/logo.png';
import styles from './styles.module.css';
import ol_map from '../../lib/openLayers';
//
import DrawingTool from '../drawingTool/DrawingTool';
function Header({ map }: { map: typeof ol_map }) {
  console.log(map);

  return (
    <header className={styles.container}>
      <img src={ugix_logo} className={styles.logo_img} alt="" />
      <div>
        <DrawingTool />
      </div>
      <div>Profile</div>
    </header>
  );
}

export default Header;
