import { ReactElement } from 'react';
import styles from './styles.module.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../context/store';
//
function LoadingWrapper({ children }: { children: ReactElement }) {
  const loading = useSelector((state: RootState) => {
    return state.loading.loading;
  });
  return (
    <>
      {children}
      {loading && (
        <div className={styles.loader}>
          <div className={styles.loading_text}>Loading...</div>
          <svg height={200} width={200} className={styles.round_frame}>
            <circle
              className={styles.circle}
              r={50}
              cx={100}
              cy={100}
              stroke="white"
              strokeWidth={6}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
        </div>
      )}
    </>
  );
}

export default LoadingWrapper;
