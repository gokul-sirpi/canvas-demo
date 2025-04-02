import * as Dialog from '@radix-ui/react-dialog';
import { TbWorldSearch } from 'react-icons/tb';
import styles from './styles.module.css';
import { IoMdClose } from 'react-icons/io';
import { plotResource } from '../../../types/plotResource';
import { FaLock, FaSearch, FaUnlock } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa6';
import { BsArrowRight } from 'react-icons/bs';
import TooltipWrapper from '../../tooltipWrapper/TooltipWrapper';
import { RiInformationFill } from 'react-icons/ri';
import { useEffect, useState } from 'react';
import envurls from '../../../utils/config';
import { MdDownloadForOffline } from 'react-icons/md';
import DownloadAdexDataDialog from '../downloadAdexDataDialog/DownloadAdexDataDialog';

export default function BrowsePlotsDialog({
  allResources,
  isOpen,
  toggleDialog,
  onAddResource,
  // setAllResources,
  noAccess,
}: {
  allResources: plotResource[];
  isOpen: boolean;
  toggleDialog: () => void;
  onAddResource: (resource: plotResource) => void;
  // setAllResources: React.Dispatch<React.SetStateAction<plotResource[]>>;
  noAccess: boolean;
}) {
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedId, setSelectedId] = useState('');
  const [resourcesList, setResourcesList] = useState<plotResource[]>([]);
  const [showAccessText, setShowAccessText] = useState({
    show: false,
    resourceId: '',
  });

  useEffect(() => {
    setResourcesList(allResources);
  }, [allResources]);

  function handleChange(text: string) {
    setSearchInput(text);
    if (text != '') {
      const filteredResources = allResources.filter((resource) => {
        if (
          resource.label &&
          resource.label.toLowerCase().includes(text.toLowerCase())
        ) {
          return resource;
        }
        return;
      });
      setResourcesList(filteredResources);
    } else {
      setResourcesList(allResources);
    }
  }

  function getinfoLink(resource: plotResource) {
    const groupId = resource.resourceGroup;
    const path = envurls.ugixCatalogue + 'dataset/' + groupId;
    window.open(path, '_blank');
  }
  const handleAddresource = (item: plotResource) => {
    onAddResource(item);
    setSelectedId(item.id);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={toggleDialog}>
      <Dialog.Trigger asChild>
        <button className={styles.header_button} autoFocus>
          <span>
            <TbWorldSearch size={25} />
          </span>
          <span>Browse ADeX</span>
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
                value={searchInput}
                onChange={(e) => handleChange(e.target.value)}
              />
              <button>
                <div className={styles.btn_icon_container}>
                  <BsArrowRight style={{ fontSize: '1.5rem' }} />
                </div>
              </button>
            </div>
          </section>
          <div className={styles.plot_btn_container}>
            {resourcesList.length > 0 ? (
              resourcesList.map((item: plotResource) => (
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
                      {noAccess && item.id === selectedId && (
                        <div className={styles.warn_text}>
                          You do not have access to view this data, please visit{' '}
                          <button
                            className={styles.warn_link}
                            onClick={() => getinfoLink(item)}
                          >
                            ADeX page
                          </button>{' '}
                          to request access
                        </div>
                      )}
                    </div>
                    <TooltipWrapper content="add">
                      <button
                        className={styles.add_button}
                        onClick={() => handleAddresource(item)}
                      >
                        <div className={styles.add_icon}>
                          <FaPlus size={23} />
                        </div>
                      </button>
                    </TooltipWrapper>
                  </div>
                  <div className={styles.icon_container}>
                    {item.resourceType === 'MESSAGESTREAM' &&
                    item.accessPolicy !== 'PII' ? (
                      <DownloadAdexDataDialog
                        item={item}
                        setNoAccessText={setShowAccessText}
                      />
                    ) : (
                      <TooltipWrapper content="Download not available for this resource">
                        <button disabled>
                          <div
                            className={styles.icon_wrapper}
                            style={{ color: 'grey' }}
                          >
                            <MdDownloadForOffline />
                          </div>
                        </button>
                      </TooltipWrapper>
                    )}
                    <TooltipWrapper content="Resource info">
                      <button onClick={() => getinfoLink(item)}>
                        <div className={styles.icon_wrapper}>
                          <RiInformationFill />
                        </div>
                      </button>
                    </TooltipWrapper>
                  </div>
                  {showAccessText.show &&
                    showAccessText.resourceId === item.id && (
                      <div className={styles.warn_text}>
                        You do not have access to view this data, please visit{' '}
                        <button
                          // style={{ textDecoration: 'underline', color: 'red' }}
                          onClick={() => getinfoLink(item)}
                          className={styles.warn_link}
                        >
                          ADeX page
                        </button>{' '}
                        to request access
                      </div>
                    )}
                </div>
              ))
            ) : (
              <div className={styles.error_container}>
                {searchInput !== '' ? (
                  <h4>No matching projects</h4>
                ) : (
                  <h4>No projects found!</h4>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
