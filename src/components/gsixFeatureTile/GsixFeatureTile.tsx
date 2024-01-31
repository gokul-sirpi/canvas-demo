import { FaUnlock } from 'react-icons/fa';
import soiImg from '../../assets/images/soi-logo.png';
import styles from './styles.module.css';
import { RiInformationFill } from 'react-icons/ri';
import { AiFillPlusCircle } from 'react-icons/ai';
function GsixFeatureTile() {
  return (
    <div className={styles.tileContainer}>
      {/* content */}
      <div className={styles.tileDescriptionContainer}>
        <div className={styles.tileImgContainer}>
          <img src={soiImg} alt="Survey Of India" className={styles.soiImg} />
          <span className={styles.soiText}>Survey Of India</span>
        </div>
        <h2 className={styles.tileTitle}>Features of intrest in Banglore</h2>
        <div className={styles.badge}>
          <FaUnlock /> Public
        </div>
      </div>
      {/* icon container */}
      <div className={styles.iconContainer}>
        <span className={styles.addIcon}>
          <AiFillPlusCircle />
        </span>
        <span className={styles.addIcon}>
          <RiInformationFill />
        </span>
      </div>
    </div>
  );
}

export default GsixFeatureTile;
