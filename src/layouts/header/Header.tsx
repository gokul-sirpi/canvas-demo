//
import ugix_logo from '../../assets/images/ugix-logo.png';
import styles from './styles.module.css';
import { UserProfile } from '../../types/UserProfile';
import * as Popover from '@radix-ui/react-popover';
import { IoMdMail } from 'react-icons/io';
import { HiUser } from 'react-icons/hi2';
import { LuLogOut } from 'react-icons/lu';
import keycloak from '../../lib/keycloak';
import TooltipWrapper from '../../components/tooltipWrapper/TooltipWrapper';
import BrowseDataDialog from '../browseDataDialog/BrowseDataDialog';
import DrawingTool from '../../components/drawingTool/DrawingTool';
import DrawingTools from '../drawingTools/DrawingTools';
import BaseMaps from '../../components/basemaps/BaseMaps';
import ExportDataDialog from '../../components/exportDataDialog/ExportDataDialog';
import ImportDataInput from '../../components/importDataInput/ImportDataInput';
import SwipeDialog from '../../components/swipeDialog/SwipeDialog';
import { Resource } from '../../types/resource';
import { keycloakEnv } from '../../utils/config';
import adexLogo from '../../assets/images/adexIntroImg.png';

function Header({
  profileData,
  changePage,
  currentPage,
  resourceList,
}: {
  profileData?: UserProfile | undefined;
  changePage: Function;
  currentPage: string;
  resourceList: Resource[];
}) {
  const mapActiveStyle =
    currentPage === 'canvas'
      ? { color: 'white', backgroundColor: '#05aa99' }
      : { color: 'white', backgroundColor: 'grey' };
  const plotsActiveStyle =
    currentPage === 'plots'
      ? { color: 'white', backgroundColor: '#05aa99' }
      : { color: 'white', backgroundColor: 'grey' };

  const userIconName = () => {
    const firstLetter = profileData?.name.firstName[0] || '';
    const secondLetter = profileData?.name.lastName[0] || '';
    if (firstLetter && secondLetter) {
      return firstLetter + secondLetter;
    }
    return 'user';
  };
  function handleLogout() {
    keycloak.logout();
  }
  const logo = keycloakEnv.realm === 'adex' ? adexLogo : ugix_logo;

  return (
    <>
      <header className={styles.container}>
        <div className={styles.button_container}>
          <img
            src={logo}
            className={
              keycloakEnv.realm === 'adex'
                ? styles.adex_logo_img
                : styles.logo_img
            }
            alt=""
          />
          {keycloakEnv.realm === 'adex' && (
            <div className={styles.category_container}>
              <button
                style={mapActiveStyle}
                onClick={() => changePage('canvas')}
                className={styles.header_button}
              >
                Maps
              </button>
              <span
                style={{
                  borderLeft: '2px solid black',
                  height: '30px',
                  margin: '0 5px',
                }}
              ></span>
              <button
                className={styles.header_button}
                style={plotsActiveStyle}
                onClick={() => changePage('plots')}
              >
                Plots
              </button>
            </div>
          )}
        </div>
        {currentPage === 'canvas' && (
          <div data-intro="header" className={styles.tools_container}>
            <TooltipWrapper
              content={`  Browse ${keycloakEnv.realm === 'adex' ? 'ADeX' : 'Geospatial'} resources`}
            >
              <span data-intro="browse">
                <BrowseDataDialog resourceList={resourceList} />
              </span>
            </TooltipWrapper>
            <TooltipWrapper content="Select">
              <span data-intro="select">
                <DrawingTool toolType="Cursor" />
              </span>
            </TooltipWrapper>
            <DrawingTools />
            <TooltipWrapper content="Add marker">
              <span data-intro="add_marker">
                <DrawingTool toolType="Point" />
              </span>
            </TooltipWrapper>
            <TooltipWrapper content="Measure distance">
              <span data-intro="measure">
                <DrawingTool toolType="Measure" />
              </span>
            </TooltipWrapper>
            <BaseMaps />
            <ExportDataDialog />
            <ImportDataInput />
            <TooltipWrapper content="Add swipe layer">
              <span data-intro="measure">
                <SwipeDialog />
              </span>
            </TooltipWrapper>
          </div>
        )}
        <div className={styles.profile_container}>
          <Popover.Root>
            <Popover.Trigger asChild>
              <button data-intro="sign_out" className={styles.profile_icon}>
                {userIconName()}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                sideOffset={-2}
                className={styles.popover_content}
              >
                <div className={styles.user_info}>
                  <div>
                    <HiUser />
                    <p className={styles.profile_name}>
                      {profileData?.name.firstName} {profileData?.name.lastName}
                    </p>
                  </div>
                  <div>
                    <IoMdMail />
                    <p className={styles.email}>{profileData?.email}</p>
                  </div>
                </div>
                <div>
                  <button onClick={handleLogout} className={styles.signout_btn}>
                    <LuLogOut size={25} /> <p>Sign Out</p>
                  </button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </header>
    </>
  );
}

export default Header;
