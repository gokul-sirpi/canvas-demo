import styles from './styles.module.css';
import LayerTile from '../../components/layerTile/LayerTile';
import { useSelector } from 'react-redux';
import { RootState } from '../../context/store';
//
import * as Accordion from '@radix-ui/react-accordion';
import { FaAngleDown } from 'react-icons/fa';

function LayerCard() {
  const userLayers = useSelector((state: RootState) => {
    return state.userLayer.layers;
  });
  const gsixLayers = useSelector((state: RootState) => {
    return state.gsixLayer.layers;
  });
  console.log(gsixLayers.length);

  return (
    <section className={styles.container}>
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
            <Accordion.AccordionContent className={styles.accordion_content}>
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
            <Accordion.AccordionContent className={styles.accordion_content}>
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
    </section>
  );
}

export default LayerCard;
