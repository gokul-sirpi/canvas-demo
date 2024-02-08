import { LiaFileDownloadSolid } from 'react-icons/lia';
//
import DrawingTool from '../../components/drawingTool/DrawingTool';
import ugix_logo from '../../assets/images/gsix-logo.svg';
import styles from './styles.module.css';
import BrowseDataDialog from '../browseDataDialog/BrowseDataDialog';
import BaseMaps from '../../components/basemaps/BaseMaps';
import { GrUserManager } from 'react-icons/gr';
import { MdArrowDropDown } from 'react-icons/md';

function Header() {
  // const [isBrowseCatalogDialogOpen, setIsBrowseCatalogDialogOpen] =
  // useState<boolean>(false);
  return (
    <>
      <header className={styles.container}>
        <img src={ugix_logo} className={styles.logo_img} alt="" />
        <div className={styles.tools_container}>
          {/* <button autoFocus onClick={() => setIsBrowseCatalogDialogOpen(true)}>
            <div className={styles.btn_icon_container}>
              <TbWorldSearch size={25} />
            </div>
          </button> */}
          <BrowseDataDialog />

          <span className={styles.tools_divider_line}></span>
          <DrawingTool toolType="Circle" />
          <span className={styles.tools_divider_line}></span>
          <DrawingTool toolType="Box" />
          <span className={styles.tools_divider_line}></span>
          <DrawingTool toolType="Point" />
          <BaseMaps />
          {/* <hr /> */}
          <button>
            <div className={styles.btn_icon_container}>
              <LiaFileDownloadSolid size={25} />
            </div>
          </button>
        </div>
        <div className={styles.profile_container}>
          <div className={styles.profile_icon_border}>
            <GrUserManager
              color="#124A00"
              size={30}
              className={styles.profile_icon}
            />
          </div>
          <h3>User</h3>
          <MdArrowDropDown color="#124A00" size={35} />
        </div>
      </header>
    </>
  );
}

export default Header;
