import * as Dialog from '@radix-ui/react-dialog';
import { TbWorldSearch } from 'react-icons/tb';
import styles from './styles.module.css';
import { IoMdClose } from 'react-icons/io';
import { plotResource } from '../../../types/plotResource';
import { FaLock, FaSearch, FaUnlock } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa6';
import { BsArrowRight } from 'react-icons/bs';
import TooltipWrapper from '../../tooltipWrapper/TooltipWrapper';
import { MdDownloadForOffline } from 'react-icons/md';
import { RiInformationFill } from 'react-icons/ri';
import { useState } from 'react';
import envurls from '../../../utils/config';

export default function BrowsePlotsDialog({
  allResources,
  isOpen,
  toggleDialog,
  onAddResource,
  setAllResources,
}: {
  allResources: plotResource[];
  isOpen: boolean;
  toggleDialog: () => void;
  onAddResource: (resource: plotResource) => void;
  setAllResources: React.Dispatch<React.SetStateAction<plotResource[]>>;
}) {
  const [searchInput, setSearchInput] = useState<string>('');

  // function handleChange(text: string) {
  //   setSearchInput(text);
  //   if (text != '') {
  //     const filteredResources = allResources.filter((resource) => {
  //       if (
  //         resource.label &&
  //         resource.label.toLowerCase().includes(text.toLowerCase())
  //       ) {
  //         return resource;
  //       }
  //       return;
  //     });
  //     setAllResources(filteredResources);
  //   } else {
  //     setAllResources(allResources);
  //   }
  // }
  function getinfoLink(resource: plotResource) {
    const groupId = resource.resourceGroup;
    const path = envurls.ugixCatalogue + 'dataset/' + groupId;
    window.open(path, '_blank');
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={toggleDialog}>
      <Dialog.Trigger asChild>
        <button className={styles.header_button} autoFocus>
          <span>
            <TbWorldSearch size={25} />
          </span>
          <span>Browse ADEX</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialog_overlay} />
        <Dialog.Content className={styles.dialog_content}>
          <Dialog.Title className={styles.dialog_title}>
            <Dialog.Close>
              <button className={styles.close_btn}>
                <div className={styles.btn_icon_container}>
                  <IoMdClose size={20} />
                </div>
              </button>
            </Dialog.Close>
          </Dialog.Title>
          <section className={styles.dialog_description}>
            <div className={styles.input_container}>
              <FaSearch className={styles.search_icon} />
              <input
                type="text"
                autoFocus
                placeholder="Explore data sets"
                // value={searchInput}
                // onChange={(e) => handleChange(e.target.value)}
              />
              <button>
                <div className={styles.btn_icon_container}>
                  <BsArrowRight style={{ fontSize: '1.5rem' }} />
                </div>
              </button>
            </div>
          </section>
          <div className={styles.plot_btn_container}>
            {allResources.length > 0
              ? allResources.map((item: plotResource) => (
                  <div key={item.id} className={styles.tile_container}>
                    <div className={styles.tile_content}>
                      <div className={styles.tile_description}>
                        <TooltipWrapper
                          content={item.label ? item.label : item.name}
                        >
                          <h2 className={styles.tile_title}>{item.label}</h2>
                        </TooltipWrapper>
                        <div className={styles.button_badge_container}>
                          {item.accessPolicy === 'OPEN' ? (
                            <div className={styles.badge}>
                              <FaUnlock /> Public
                            </div>
                          ) : (
                            <div
                              className={`${styles.badge} ${styles.badge_private}`}
                            >
                              <FaLock /> Private
                            </div>
                          )}
                        </div>
                      </div>
                      <TooltipWrapper content="add">
                        <button
                          className={styles.add_button}
                          onClick={() => onAddResource(item)}
                        >
                          <div className={styles.add_icon}>
                            <FaPlus size={23} />
                          </div>
                        </button>
                      </TooltipWrapper>
                    </div>

                    <div className={styles.icon_container}>
                      <TooltipWrapper content="Download complete resources">
                        <button>
                          <div className={styles.icon_wrapper}>
                            <MdDownloadForOffline />
                          </div>
                        </button>
                      </TooltipWrapper>
                      <TooltipWrapper content="Resource info">
                        <button onClick={() => getinfoLink(item)}>
                          <div className={styles.icon_wrapper}>
                            <RiInformationFill />
                          </div>
                        </button>
                      </TooltipWrapper>
                    </div>
                  </div>
                ))
              : //   <div className={styles.error_container}>
                //   {searchInput !== '' ? (
                //     <h4>No matching projects</h4>
                //   ) : (
                //     <h4>No projects found!</h4>
                //   )}
                // </div>
                'No data available'}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
