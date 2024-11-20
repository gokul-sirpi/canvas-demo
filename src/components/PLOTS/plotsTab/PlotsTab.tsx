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
}) {
  function handleTabSwitching(resource: plotResource) {
    setActiveTab(resource.id);
    onTabSwitching(resource);
  }

  return (
    <div className={styles.container}>
      <BrowsePlotsDialog
        allResources={allResources}
        isOpen={isOpen}
        toggleDialog={toggleDialog}
        onAddResource={onAddResource}
        setAllResources={setAllResources}
      />
      {tabs.length > 0 ? (
        tabs.map((item: plotResource) => (
          <TooltipWrapper content={item.label}>
            <div
              className={
                item.id === activeTab ? styles.selected_tab : styles.tab_box
              }
            >
              <button
                key={item.id}
                className={
                  item.id === activeTab ? styles.active : styles.not_active
                }
                onClick={() => handleTabSwitching(item)}
                type="button"
              >
                {item.label}
              </button>
              <MdClose
                size={25}
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(item.id);
                }}
                type="button"
                cursor={'pointer'}
              />
            </div>
          </TooltipWrapper>
        ))
      ) : (
        <div>No tabs available</div>
      )}
    </div>
  );
}
