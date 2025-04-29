import { AiOutlineSplitCells } from 'react-icons/ai';
import openLayerMap from '../../lib/openLayers';
import { useDispatch, useSelector } from 'react-redux';
import { updateSwipeState } from '../../context/SwipeShowing/SwipeSlice';
import { RootState } from '../../context/store';
import * as Dialog from '@radix-ui/react-dialog';
import styles from './styles.module.css';
import LayerTile from '../layerTile/LayerTile';
import { DragEvent, useEffect, useRef, useState } from 'react';
import { UserLayer } from '../../types/UserLayer';
import { UgixLayer } from '../../types/UgixLayers';
import { updateLayerSides } from '../../context/canvasLayers/canvasLayerSlice';
import { IoMdClose } from 'react-icons/io';

export default function SwipeDialog() {
  const swipeShown = useSelector((state: RootState) => {
    return state.swipeShown.swipeShown;
  });
  const canvasLayers = useSelector((state: RootState) => {
    return state.canvasLayer.layers;
  });
  const [leftSide, setLeftSide] = useState<(UserLayer | UgixLayer)[]>([]);
  const [rightSide, setRightSide] = useState<(UserLayer | UgixLayer)[]>([]);
  const [middle, setMiddle] = useState<(UserLayer | UgixLayer)[]>([]);
  const selectedRef = useRef<HTMLDivElement>();
  const dispatch = useDispatch();

  useEffect(() => {
    const rightMap = new Map<string, string>();
    const leftMap = new Map<string, string>();
    for (const layer of rightSide) {
      rightMap.set(layer.layerId, layer.layerName);
    }
    for (const layer of leftSide) {
      leftMap.set(layer.layerId, layer.layerName);
    }
    const newLeft: (UserLayer | UgixLayer)[] = [];
    const newRight: (UserLayer | UgixLayer)[] = [];
    const newMiddle: (UserLayer | UgixLayer)[] = [];
    for (const layer of canvasLayers) {
      if (
        'sourceType' in layer &&
        'ugixLayerId' in layer &&
        'ugixGroupId' in layer &&
        'featureType' in layer
      ) {
        if (rightMap.get(layer.layerId)) {
          newRight.push(layer);
          continue;
        } else if (leftMap.get(layer.layerId)) {
          newLeft.push(layer);
        } else {
          newMiddle.push(layer);
        }
      }
    }
    setRightSide(newRight);
    setLeftSide(newLeft);
    setMiddle(newMiddle);
  }, [canvasLayers]);

  function saveSwipeLayer() {
    const leftIds = leftSide.map((layer) => {
      return layer.layerId;
    });
    const rightIds = rightSide.map((layer) => layer.layerId);
    const middleIds = middle.map((layer) => layer.layerId);
    openLayerMap.addSwipeLayer(leftIds, rightIds, middleIds);
    dispatch(updateLayerSides({ rightIds, leftIds, middleIds }));
    dispatch(updateSwipeState(true));
  }

  function removeSwipeLayer() {
    const rightIds = rightSide.map((layer) => layer.layerId);
    openLayerMap.removeSwipeLayer(rightIds);
    dispatch(updateSwipeState(false));
  }

  function handleDragStart(event: DragEvent) {
    // event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    selectedRef.current = event.target as HTMLDivElement;
  }
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  function dropHandler(event: DragEvent, side: 'right' | 'left' | 'middle') {
    event.preventDefault();
    const layerId = selectedRef.current?.getAttribute('data-id');
    if (side === 'left') {
      for (let i = 0; i < canvasLayers.length; i++) {
        const layer = canvasLayers[i];
        if (layer.layerId === layerId) {
          setLeftSide((prev) => {
            if (
              'sourceType' in layer &&
              'ugixLayerId' in layer &&
              'ugixGroupId' in layer &&
              'featureType' in layer
            ) {
              prev.push(layer);
            }
            return [...prev];
          });
          const newRightSide = rightSide.filter(
            (layer) => layer.layerId !== layerId
          );
          const newMiddle = middle.filter((layer) => layer.layerId !== layerId);
          setMiddle(newMiddle);
          setRightSide(newRightSide);
          break;
        }
      }
    }
    if (side === 'right') {
      for (let i = 0; i < canvasLayers.length; i++) {
        const layer = canvasLayers[i];
        if (layer.layerId === layerId) {
          setRightSide((prev) => {
            if (
              'sourceType' in layer &&
              'ugixLayerId' in layer &&
              'ugixGroupId' in layer &&
              'featureType' in layer
            ) {
              prev.push(layer);
            }
            return [...prev];
          });
          const newLeftSide = leftSide.filter(
            (layer) => layer.layerId !== layerId
          );
          const newMiddle = middle.filter((layer) => layer.layerId !== layerId);
          setMiddle(newMiddle);
          setLeftSide(newLeftSide);
          break;
        }
      }
    }
    if (side === 'middle') {
      for (let i = 0; i < canvasLayers.length; i++) {
        const layer = canvasLayers[i];
        if (layer.layerId === layerId) {
          setMiddle((prev) => {
            if (
              'sourceType' in layer &&
              'ugixLayerId' in layer &&
              'ugixGroupId' in layer &&
              'featureType' in layer
            ) {
              prev.push(layer);
            }
            return [...prev];
          });
          const newLeftSide = leftSide.filter(
            (layer) => layer.layerId !== layerId
          );
          const newRightSide = rightSide.filter(
            (layer) => layer.layerId !== layerId
          );
          setRightSide(newRightSide);
          setLeftSide(newLeftSide);
          break;
        }
      }
    }
  }
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button disabled={canvasLayers.length === 0} className="header_button">
          <AiOutlineSplitCells size={22} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialog_overlay} />
        <Dialog.Content className={styles.dialog_content}>
          <Dialog.Title className={styles.dialog_title}>
            <Dialog.Close asChild>
              <button className={styles.close_btn}>
                <div className={styles.btn_icon_container}>
                  <IoMdClose size={20} />
                </div>
              </button>
            </Dialog.Close>
          </Dialog.Title>
          <div className={styles.dialog_container}>
            <section className={styles.two_sides}>
              <div className={styles.heading}>L</div>
              <div className={styles.heading}>Default</div>
              <div className={styles.heading}>R</div>
              <div
                className={styles.droppable_container}
                onDrop={(ev) => dropHandler(ev, 'left')}
                onDragOver={handleDragOver}
              >
                {leftSide.map((layer, index) => {
                  return (
                    <div
                      data-id={layer.layerId}
                      key={layer.layerId}
                      draggable="true"
                      onDragStart={handleDragStart}
                    >
                      <LayerTile layer={layer} index={index} isTile={false} />
                    </div>
                  );
                })}
              </div>
              <div
                className={styles.droppable_container}
                onDrop={(ev) => dropHandler(ev, 'middle')}
                onDragOver={handleDragOver}
              >
                {middle.map((layer, index) => {
                  return (
                    <div
                      data-id={layer.layerId}
                      key={layer.layerId}
                      draggable="true"
                      onDragStart={handleDragStart}
                    >
                      <LayerTile layer={layer} index={index} isTile={false} />
                    </div>
                  );
                })}
              </div>
              <div
                className={styles.droppable_container}
                onDrop={(ev) => dropHandler(ev, 'right')}
                onDragOver={handleDragOver}
              >
                {rightSide.map((layer, index) => {
                  return (
                    <div
                      data-id={layer.layerId}
                      key={layer.layerId}
                      draggable="true"
                      onDragStart={handleDragStart}
                    >
                      <LayerTile layer={layer} index={index} isTile={false} />
                    </div>
                  );
                })}
              </div>
            </section>
            <div className={styles.dialog_footer}>
              <Dialog.Close asChild>
                <button className={styles.cancel_btn}>Cancel</button>
              </Dialog.Close>
              {swipeShown && (
                <Dialog.Close asChild>
                  <button
                    className={styles.remove_btn}
                    onClick={removeSwipeLayer}
                  >
                    Remove swipe
                  </button>
                </Dialog.Close>
              )}
              <Dialog.Close asChild>
                <button className={styles.save_btn} onClick={saveSwipeLayer}>
                  Save
                </button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
