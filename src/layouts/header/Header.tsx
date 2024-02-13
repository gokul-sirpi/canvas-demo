//
import DrawingTool from '../../components/drawingTool/DrawingTool';
import ugix_logo from '../../assets/images/gsix-logo.svg';
import styles from './styles.module.css';
import BrowseDataDialog from '../browseDataDialog/BrowseDataDialog';
import BaseMaps from '../../components/basemaps/BaseMaps';
import ExportDataDialog from '../../components/exportDataDialog/ExportDataDialog';
import TooltipWrapper from '../../components/tooltipWrapper/TooltipWrapper';
import { UserProfile } from '../../types/UserProfile';

function Header({ profileData }: { profileData: UserProfile | undefined }) {
  const userIconName = () => {
    const firstLetter = profileData?.name.firstName[0] || '';
    const secondLetter = profileData?.name.lastName[0] || '';
    if (firstLetter && secondLetter) {
      return firstLetter + secondLetter;
    }
    return 'user';
  };
  return (
    <>
      <header className={styles.container}>
        <img src={ugix_logo} className={styles.logo_img} alt="" />
        <div className={styles.tools_container}>
          <TooltipWrapper content="Browse Data">
            <span>
              <BrowseDataDialog />
            </span>
          </TooltipWrapper>

          <TooltipWrapper content="Circle">
            <span>
              <DrawingTool toolType="Circle" />
            </span>
          </TooltipWrapper>
          <TooltipWrapper content="Box ">
            <span>
              <DrawingTool toolType="Box" />
            </span>
          </TooltipWrapper>
          <TooltipWrapper content="Marker">
            <span>
              <DrawingTool toolType="Marker" />
            </span>
          </TooltipWrapper>
          <TooltipWrapper content="Base Maps">
            <span>
              <BaseMaps />
            </span>
          </TooltipWrapper>
          <TooltipWrapper content="Export as">
            <span>
              <ExportDataDialog />
            </span>
          </TooltipWrapper>
        </div>
        <div className={styles.profile_container}>
          <div className={styles.profile_icon}>{userIconName()}</div>
        </div>
      </header>
    </>
  );
}

export default Header;
