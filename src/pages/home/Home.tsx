//
import styles from './styles.module.css';
import ugixLogo from '../../assets/images/ugix-logo.png';
import adexLogo from '../../assets/images/adexIntroImg.png';
import { keycloakEnv } from '../../utils/config';

function Home() {
  const logo = keycloakEnv.realm === 'adex' ? adexLogo : ugixLogo;
  return (
    <section className={styles.container}>
      <div>
        <img src={logo} className={styles.logo_img} alt="ugix-logo" />
      </div>
      <h2 className={styles.heading}>
        {keycloakEnv.realm === 'adex'
          ? 'Login to ADeX Account'
          : 'Login to GDI Account'}
      </h2>
      <p className={styles.description}>
        Please complete your login in the opened tab/popup to get access to the
        canvas. In case, a new tab has not opened, please enable the browser to
        open popups from this website.
      </p>
    </section>
  );
}

export default Home;
