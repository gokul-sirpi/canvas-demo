import { plotResource } from '../../../types/plotResource';
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
          <button
            key={item.id}
            className={
              item.id === activeTab ? styles.selected_tab : styles.tab_box
            }
            onClick={() => handleTabSwitching(item)}
            type="button"
          >
            {item.label}
            <MdClose
              size={25}
              onClick={(e) => {
                e.stopPropagation();
                removeTab(item.id);
              }}
              type="button"
            />
          </button>
        ))
      ) : (
        <div>No tabs available</div>
      )}
    </div>
  );
}
