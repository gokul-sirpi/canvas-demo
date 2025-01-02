import { plotResource } from '../../../types/plotResource';
import TooltipWrapper from '../../tooltipWrapper/TooltipWrapper';
import BrowsePlotsDialog from '../browsePlotsDialog/BrowsePlotsDialog';
import styles from './styles.module.css';
import { MdClose } from 'react-icons/md';

export default function PlotsTab({
  allResources,
  tabs,
  activeTab,
  setActiveTab,
  removeTab,
  isOpen,
  toggleDialog,
  onAddResource,
  onTabSwitching,
  setAllResources,
  noAccess,
}: {
  tabs: plotResource[];
  activeTab: string | null;
  setActiveTab: React.Dispatch<React.SetStateAction<string | null>>;
  removeTab: (tabValue: string) => void;
  allResources: plotResource[];
  isOpen: boolean;
  toggleDialog: () => void;
  onAddResource: (resource: plotResource) => void;
  onTabSwitching: (id: plotResource) => void;
  setAllResources: React.Dispatch<React.SetStateAction<plotResource[]>>;
  noAccess: boolean;
}) {
  function handleTabSwitching(resource: plotResource) {
    setActiveTab(resource.uniqueResourceId);
    onTabSwitching(resource);
  }

  return (
    <div className={styles.container}>
      <BrowsePlotsDialog
        allResources={allResources}
        isOpen={isOpen}
        toggleDialog={toggleDialog}
        onAddResource={onAddResource}
        // @ts-ignore
        setAllResources={setAllResources}
        noAccess={noAccess}
      />
      {tabs.length > 0 ? (
        tabs
          .slice()
          .reverse()
          .map((item: plotResource) => (
            <TooltipWrapper key={item.uniqueResourceId} content={item.label}>
              <div
                className={
                  item.uniqueResourceId === activeTab
                    ? styles.selected_tab
                    : styles.tab_box
                }
              >
                <button
                  key={item.uniqueResourceId}
                  className={
                    item.uniqueResourceId === activeTab
                      ? styles.active
                      : styles.not_active
                  }
                  onClick={() => handleTabSwitching(item)}
                  type="button"
                >
                  {item.label}
                </button>
                <span className={styles.close_icon}>
                  <MdClose
                    size={25}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(item.uniqueResourceId);
                    }}
                    type="button"
                    cursor={'pointer'}
                  />
                </span>
              </div>
            </TooltipWrapper>
          ))
      ) : (
        <div></div>
      )}
    </div>
  );
}
