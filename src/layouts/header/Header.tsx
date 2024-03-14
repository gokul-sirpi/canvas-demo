//
import DrawingTool from '../../components/drawingTool/DrawingTool';
import ugix_logo from '../../assets/images/gsix-logo.svg';
import styles from './styles.module.css';
import BrowseDataDialog from '../browseDataDialog/BrowseDataDialog';
import BaseMaps from '../../components/basemaps/BaseMaps';
import ExportDataDialog from '../../components/exportDataDialog/ExportDataDialog';
import TooltipWrapper from '../../components/tooltipWrapper/TooltipWrapper';
import { UserProfile } from '../../types/UserProfile';
import { Resource } from '../../types/resource';
import ImportDataInput from '../../components/importDataInput/ImportDataInput';
import DrawingTools from '../drawingTools/DrawingTools';

function Header({
  profileData,
  resourceList,
}: {
  profileData: UserProfile | undefined;
  resourceList: Resource[];
}) {
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
        <div data-intro="header" className={styles.tools_container}>
          <TooltipWrapper content="Browse Ugix  resources">
            <span data-intro="browse">
              <BrowseDataDialog resourceList={resourceList} />
            </span>
          </TooltipWrapper>
          <TooltipWrapper content="Select">
            <span>
              <DrawingTool toolType="Cursor" />
            </span>
          </TooltipWrapper>
          <DrawingTools />
          <TooltipWrapper content="Add marker">
            <span>
              <DrawingTool toolType="Marker" />
            </span>
          </TooltipWrapper>
          <TooltipWrapper content="Measure distance">
            <span>
              <DrawingTool toolType="Measure" />
            </span>
          </TooltipWrapper>
          <BaseMaps />
          <ExportDataDialog />
          <ImportDataInput />
        </div>
        <div className={styles.profile_container}>
          <div className={styles.profile_icon}>{userIconName()}</div>
        </div>
      </header>
    </>
  );
}

export default Header;
