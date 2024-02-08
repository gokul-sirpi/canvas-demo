import { LiaFileDownloadSolid } from 'react-icons/lia';
import { TbWorldSearch } from 'react-icons/tb';
//
import DrawingTool from '../../components/drawingTool/DrawingTool';
import ugix_logo from '../../assets/images/gsix-logo.svg';
import styles from './styles.module.css';
import { useState } from 'react';
import BrowseDataDialog from '../browseDataDialog/BrowseDataDialog';
import BaseMaps from '../../components/basemaps/BaseMaps';

function Header() {
  const [isBrowseCatalogDialogOpen, setIsBrowseCatalogDialogOpen] =
    useState<boolean>(false);

  return (
    <>
      <header className={styles.container}>
        <img src={ugix_logo} className={styles.logo_img} alt="" />
        <div className={styles.tools_container}>
          <button autoFocus onClick={() => setIsBrowseCatalogDialogOpen(true)}>
            <div className={styles.btn_icon_container}>
              <TbWorldSearch size={25} />
            </div>
          </button>
          <DrawingTool toolType="Circle" />
          <DrawingTool toolType="Box" />
          <DrawingTool toolType="Point" />
          <BaseMaps />
          {/* <hr /> */}
          <button>
            <div className={styles.btn_icon_container}>
              <LiaFileDownloadSolid size={25} />
            </div>
          </button>
        </div>
        <div>Profile</div>
      </header>
      <BrowseDataDialog
        isDialogOpen={isBrowseCatalogDialogOpen}
        setIsDialogOpen={() => setIsBrowseCatalogDialogOpen(false)}
      />
    </>
  );
}

export default Header;
