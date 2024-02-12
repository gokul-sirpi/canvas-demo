import styles from './styles.module.css';
import LayerTile from '../../components/layerTile/LayerTile';
import { useSelector } from 'react-redux';
import { RootState } from '../../context/store';
//
import * as Accordion from '@radix-ui/react-accordion';
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleDown,
} from 'react-icons/fa';
import { useState } from 'react';

function LayerCard() {
  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);
  const userLayers = useSelector((state: RootState) => {
    return state.userLayer.layers;
  });
  const gsixLayers = useSelector((state: RootState) => {
    return state.gsixLayer.layers;
  });

  return (
    <section>
      {isCardOpen ? (
        <div
          className={`${styles.container} ${isCardOpen ? styles.visible : styles.invisible}`}
        >
          <div className={`${styles.card_container} `}>
            <Accordion.Root
              className={styles.accordion_root}
              defaultValue={['ugix', 'user']}
              type="multiple"
            >
              <Accordion.Item className={styles.accordion_item} value="ugix">
                <div className={styles.user_layer_container}>
                  <Accordion.Trigger className={styles.accordion_trigger}>
                    <h3>UGIX Layers</h3>
                    <span className={styles.FaAngleDown}>
                      <FaAngleDown />
                    </span>
                  </Accordion.Trigger>
                  <Accordion.AccordionContent
                    className={styles.accordion_content}
                  >
                    {gsixLayers.length === 0 ? (
                      <div className={styles.noData}>No layers avalaible</div>
                    ) : (
                      <div className={styles.layer_container}>
                        {gsixLayers.map((layer, index) => {
                          return (
                            <LayerTile
                              key={layer.layerId}
                              layer={layer}
                              index={index}
                            />
                          );
                        })}
                      </div>
                    )}
                  </Accordion.AccordionContent>
                </div>
              </Accordion.Item>
              <Accordion.Item className={styles.accordion_item} value="user">
                <div className={styles.user_layer_container}>
                  <Accordion.Trigger className={styles.accordion_trigger}>
                    <h3>User Layers</h3>
                    <span className={styles.FaAngleDown}>
                      <FaAngleDown />
                    </span>
                  </Accordion.Trigger>
                  <Accordion.AccordionContent
                    className={styles.accordion_content}
                  >
                    {userLayers.length === 0 ? (
                      <div className={styles.noData}>No layers avalaible</div>
                    ) : (
                      <div className={styles.layer_container}>
                        {userLayers.map((layer, index) => {
                          return (
                            <LayerTile
                              key={layer.layerId}
                              layer={layer}
                              index={index}
                            />
                          );
                        })}
                      </div>
                    )}
                  </Accordion.AccordionContent>
                </div>
              </Accordion.Item>
            </Accordion.Root>
          </div>
          <button
            onClick={() => setIsCardOpen(false)}
            className={styles.min_max_icons_container}
          >
            <FaAngleDoubleLeft className={styles.min_max_icon} />
          </button>
        </div>
      ) : (
        <div className={styles.small_card_container}>
          <div>Layers</div>
          <button
            className={styles.min_max_icons_container}
            onClick={() => setIsCardOpen(true)}
          >
            <FaAngleDoubleRight className={styles.min_max_icon} />
          </button>
        </div>
      )}
    </section>
  );
}

export default LayerCard;
