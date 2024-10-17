import Header from '../../layouts/header/Header';
import { UserProfile } from '../../types/UserProfile';
import styles from './styles.module.css';
import PlotsTab from '../../components/plotsTab/PlotsTab';
import { useState } from 'react';

type tabValue = {
  label: string;
  description: string;
  value: number;
};

export default function Plots({
  changePage,
  profileData,
  currentPage,
}: {
  changePage: Function;
  profileData?: UserProfile | undefined;
  currentPage: string;
}) {
  const [tabs, setTabs] = useState<tabValue[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);

  const removeTab = (tabValue: number) => {
    const filteredTabs = tabs.filter((tab) => tab.value !== tabValue);
    setTabs(filteredTabs);

    if (activeTab === tabValue && filteredTabs.length > 0) {
      setActiveTab(filteredTabs[filteredTabs.length - 1].value);
    } else if (filteredTabs.length === 0) {
      setActiveTab(null);
    }
  };

  const addTab = (newTab: tabValue) => {
    setTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTab(newTab.value);
  };

  return (
    <div className={styles.container}>
      <Header
        profileData={profileData}
        changePage={changePage}
        currentPage={currentPage}
      />
      <div className={styles.tabContianer}>
        <div>
          <PlotsTab
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            removeTab={removeTab}
            addTab={addTab}
          />
          <div className={styles.tab_content}>
            {tabs.length > 0 && activeTab !== null ? (
              <>
                <h3>
                  {tabs.find((tab) => tab.value === activeTab)?.description}
                </h3>
              </>
            ) : (
              <div>No tabs available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
