import { TbWorldSearch } from 'react-icons/tb';
import ugix_logo from '../../assets/images/gsix-logo.svg';
import styles from './styles.module.css';
//
import { IoLayersOutline, IoSquareOutline } from 'react-icons/io5';
import { SlLocationPin } from 'react-icons/sl';
import { GoCircle } from 'react-icons/go';
import { LiaFileDownloadSolid } from 'react-icons/lia';

type drawType = 'Circle' | 'Box' | 'Point';
function Header({ addFeature }: { addFeature: (type: drawType) => void }) {
  function drawBbox(type: drawType) {
    addFeature(type);
  }

  return (
    <header className={styles.container}>
      <img src={ugix_logo} className={styles.logo_img} alt="" />
      <div className={styles.tools_container}>
        <button autoFocus>
          <div className={styles.btn_icon_container}>
            <TbWorldSearch size={25} />
          </div>
        </button>
        {/* <hr /> */}
        <button onClick={() => drawBbox('Circle')}>
          <div className={styles.btn_icon_container}>
            <GoCircle size={25} />
          </div>
        </button>
        {/* <hr /> */}
        <button onClick={() => drawBbox('Box')}>
          <div className={styles.btn_icon_container}>
            <IoSquareOutline size={25} />
          </div>
        </button>
        {/* <hr /> */}
        <button onClick={() => drawBbox('Point')}>
          <div className={styles.btn_icon_container}>
            <SlLocationPin size={25} />
          </div>
        </button>
        {/* <hr /> */}
        <button>
          <div className={styles.btn_icon_container}>
            <IoLayersOutline size={25} />
          </div>
        </button>
        {/* <hr /> */}
        <button>
          <div className={styles.btn_icon_container}>
            <LiaFileDownloadSolid size={25} />
          </div>
        </button>
      </div>
      <div>Profile</div>
    </header>
  );
}

export default Header;
