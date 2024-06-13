import { ReactNode, useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';
export default function IntersectObserver({
  children,
  root,
}: {
  children: ReactNode;
  root: HTMLDivElement | null;
  length: number;
}) {
  const elementRef = useRef<HTMLTableRowElement>(null);
  const [intersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIntersecting(true);
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        }
      },
      { threshold: 0.1, root }
    );
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <tr className={styles.tb_tr} ref={elementRef}>
      {intersecting ? <>{children}</> : null}
    </tr>
  );
}
