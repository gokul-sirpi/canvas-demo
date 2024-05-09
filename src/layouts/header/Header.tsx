//
import DrawingTool from '../../components/drawingTool/DrawingTool';
import ugix_logo from '../../assets/images/ugix-logo.png';
import styles from './styles.module.css';
import BrowseDataDialog from '../browseDataDialog/BrowseDataDialog';
import BaseMaps from '../../components/basemaps/BaseMaps';
import ExportDataDialog from '../../components/exportDataDialog/ExportDataDialog';
import TooltipWrapper from '../../components/tooltipWrapper/TooltipWrapper';
import { UserProfile } from '../../types/UserProfile';
import { Resource } from '../../types/resource';
import ImportDataInput from '../../components/importDataInput/ImportDataInput';
import DrawingTools from '../drawingTools/DrawingTools';
import * as Popover from '@radix-ui/react-popover';
import { IoMdMail } from 'react-icons/io';
import { HiUser } from 'react-icons/hi2';
import { LuLogOut } from 'react-icons/lu';
import keycloak from '../../lib/keycloak';

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
  function handleLogout() {
    keycloak.logout();
  }
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
        </div>
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
