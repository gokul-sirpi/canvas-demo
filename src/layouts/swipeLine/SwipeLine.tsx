import { PiSplitHorizontalBold } from 'react-icons/pi';
import styles from './styles.module.css';
import { useEffect, useRef } from 'react';
import openLayerMap from '../../lib/openLayers';
import { useSelector } from 'react-redux';
import { RootState } from '../../context/store';

export default function SwipeLine() {
  const moverRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const swiperShown = useSelector((state: RootState) => {
    return state.swipeShown.swipeShown;
  });
  useEffect(() => {
    if (swiperShown) {
      if (containerRef.current) {
        containerRef.current.style.left = 'calc(100vw / 2)';
        openLayerMap.updateSwipeLayer(0.5);
      }
    }
  }, [swiperShown]);
  function handleIconMouseDown() {
    if (moverRef.current) {
      document.addEventListener('mousemove', handleMouseMove);
    }
  }
  function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }
  function handleMouseMove(event: MouseEvent) {
    document.addEventListener('mouseup', handleMouseUp);
    if (containerRef.current) {
      containerRef.current.style.left = `${event.pageX}px`;
      const swipePercentage = event.pageX / window.innerWidth;
      openLayerMap.updateSwipeLayer(swipePercentage);
    }
  }
  return (
    <div
      data-displayed={swiperShown}
      ref={containerRef}
      className={styles.container}
    >
      <div
        onMouseUp={handleMouseUp}
        onMouseDown={handleIconMouseDown}
        ref={moverRef}
        className={styles.move_icon}
      >
        <PiSplitHorizontalBold size={26} />
      </div>
    </div>
  );
}
