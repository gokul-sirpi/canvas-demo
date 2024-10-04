import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';
import PropertyTable from '../../components/propertyTable/PropertyTable';
import { IoMdClose } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../context/store';
import { updateFooterShownState } from '../../context/footerState/footerStateSlice';
import { toast } from 'react-toastify';

const MIN_HEIGHT = window.innerHeight * 0.2;
const MAX_HEIGHT = window.innerHeight * 0.7;
const DEFAULT_HEIGHT = window.innerHeight * 0.5;
export default function AdjustableFooter() {
  const moverRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFooterShown = useSelector((state: RootState) => {
    return state.footerState.footerShown;
  });
  const dispatch = useDispatch();

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
      containerRef.current.style.height = `${Math.min(Math.max(window.innerHeight - event.pageY, MIN_HEIGHT), MAX_HEIGHT)}px`;
    }
  }

  const [controller, setController] = useState<AbortController | null>(null);

  function handleFooterClosing() {
    if (controller) {
      controller.abort();
      setController(null);
    }
    toast.dismiss();
    dispatch(updateFooterShownState(false));
  }

  useEffect(() => {
    if (isFooterShown) {
      const newController = new AbortController();
      setController(newController);
    }
  }, [isFooterShown]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (isFooterShown) {
      containerRef.current.style.height = `${DEFAULT_HEIGHT}px`;
    } else {
      containerRef.current.style.height = '0px';
    }
  }, [isFooterShown]);

  return (
    <div ref={containerRef} className={styles.container}>
      <div
        onMouseUp={handleMouseUp}
        onMouseDown={handleIconMouseDown}
        ref={moverRef}
        className={styles.footer_top_border}
      ></div>
      <button onClick={handleFooterClosing} className={styles.close_btn}>
        <IoMdClose size={20} />
      </button>

      {controller && (
        <PropertyTable footerStatus={isFooterShown} controller={controller} />
      )}
    </div>
  );
}
