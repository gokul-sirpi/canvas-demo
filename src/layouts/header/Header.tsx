import { LiaFileDownloadSolid } from 'react-icons/lia';
//
import DrawingTool from '../../components/drawingTool/DrawingTool';
import ugix_logo from '../../assets/images/gsix-logo.svg';
import styles from './styles.module.css';
import BrowseDataDialog from '../browseDataDialog/BrowseDataDialog';
import BaseMaps from '../../components/basemaps/BaseMaps';
import TooltipWrapper from '../../components/tooltipWrapper/TooltipWrapper';

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

          <TooltipWrapper content="circle">
            <span>
              <DrawingTool toolType="Circle" />
            </span>
          </TooltipWrapper>
          <TooltipWrapper content="box ">
            <span>
              <DrawingTool toolType="Box" />
            </span>
          </TooltipWrapper>
          <TooltipWrapper content="point">
            <span>
              <DrawingTool toolType="Point" />
            </span>
          </TooltipWrapper>
          <BaseMaps />
          {/* <hr /> */}
          <TooltipWrapper content="download">
            <button>
              <div className={styles.btn_icon_container}>
                <LiaFileDownloadSolid size={25} />
              </div>
            </button>
          </TooltipWrapper>
        </div>
        <div className={styles.profile_container}>
          <div className={styles.profile_icon}>PP</div>
        </div>
      </header>
    </>
  );
}

export default Header;
