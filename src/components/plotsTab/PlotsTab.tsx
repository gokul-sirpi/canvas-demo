import BrowsePlotsDialog from '../browsePlotsDialog/BrowsePlotsDialog';
import styles from './styles.module.css';
import { MdClose } from 'react-icons/md';

type tabValue = {
  label: string;
  description: string;
  value: number;
};

export default function PlotsTab({
  tabs,
  activeTab,
  setActiveTab,
  removeTab,
  addTab,
}: {
  tabs: tabValue[];
  activeTab: number | null;
  setActiveTab: React.Dispatch<React.SetStateAction<number | null>>;
  removeTab: (tabValue: number) => void;
  addTab: (tab: tabValue) => void;
}) {
  return (
    <div className={styles.tab_manager}>
      <BrowsePlotsDialog addTab={addTab} tabs={tabs} />
      {tabs.length > 0 ? (
        tabs.map((item) => (
          <button
            key={item.value}
            className={
              item.value === activeTab ? styles.selected_tab : styles.tab_box
            }
            onClick={() => setActiveTab(item.value)}
          >
            {item.label}
            <MdClose
              size={25}
              onClick={(e) => {
                e.stopPropagation();
                removeTab(item.value);
              }}
            />
          </button>
        ))
      ) : (
        <div>No tabs available</div>
      )}
    </div>
  );
}
