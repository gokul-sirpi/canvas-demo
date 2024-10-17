import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { TbWorldSearch } from 'react-icons/tb';
import styles from './styles.module.css';
import { IoMdClose } from 'react-icons/io';

type tabValue = {
  label: string;
  description: string;
  value: number;
};

const INITIAL_TABS: tabValue[] = [
  { label: 'Tab 1', description: 'Description 1', value: 1 },
  { label: 'Tab 2', description: 'Description 2', value: 2 },
  { label: 'Tab 3', description: 'Description 3', value: 3 },
];

export default function BrowsePlotsDialog({
  addTab,
  tabs,
}: {
  addTab: (tab: tabValue) => void;
  tabs: tabValue[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAdd = (item: tabValue) => {
    if (!tabs.some((tab) => tab.value === item.value)) {
      addTab(item);
    }
    setIsDialogOpen(false);
  };

  return (
    <Dialog.Root open={isDialogOpen}>
      <Dialog.Trigger asChild>
        <button
          className={styles.header_button}
          autoFocus
          onClick={() => setIsDialogOpen(true)}
        >
          <TbWorldSearch size={25} /> Browse ADEX
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialog_overlay} />
        <Dialog.Content className={styles.dialog_content}>
          <Dialog.Title className={styles.dialog_title}>
            <button
              className={styles.close_btn}
              onClick={() => setIsDialogOpen(false)}
            >
              <div className={styles.btn_icon_container}>
                <IoMdClose size={20} />
              </div>
            </button>
          </Dialog.Title>
          <div className={styles.plot_btn_container}>
            {INITIAL_TABS.map((item) => (
              <div key={item.value} className={styles.button_container}>
                {item.label}
                <button
                  className={styles.header_button}
                  onClick={() => handleAdd(item)}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
