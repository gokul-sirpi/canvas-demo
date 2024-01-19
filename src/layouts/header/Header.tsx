import ugix_logo from '../../assets/images/logo.png';
import styles from './styles.module.css';
//
function Header() {
  return (
    <header className={styles.container}>
      <img src={ugix_logo} className={styles.logo_img} alt="" />
      {/* <div>Tools</div> */}
      {/* <div>Profile</div> */}
    </header>
  );
}

export default Header;
