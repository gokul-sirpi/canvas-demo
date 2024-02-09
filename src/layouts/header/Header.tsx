//
import DrawingTool from '../../components/drawingTool/DrawingTool';
import ugix_logo from '../../assets/images/gsix-logo.svg';
import styles from './styles.module.css';
import BrowseDataDialog from '../browseDataDialog/BrowseDataDialog';
import BaseMaps from '../../components/basemaps/BaseMaps';
import ExportDataDialog from '../../components/exportDataDialog/ExportDataDialog';

function Header() {
  // const [isBrowseCatalogDialogOpen, setIsBrowseCatalogDialogOpen] =
  // useState<boolean>(false);
  return (
    <>
      <header className={styles.container}>
        <img src={ugix_logo} className={styles.logo_img} alt="" />
        <div className={styles.tools_container}>
          <BrowseDataDialog />
          <DrawingTool toolType="Circle" />
          <DrawingTool toolType="Box" />
          <DrawingTool toolType="Point" />
          <BaseMaps />
          <ExportDataDialog />
        </div>
        <div className={styles.profile_container}>
          <div className={styles.profile_icon}>PP</div>
        </div>
      </header>
    </>
  );
}

export default Header;
