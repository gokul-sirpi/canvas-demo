//
import styles from './styles.module.css';
import ugixLogo from '../../assets/images/ugix-logo.png';

function Home() {
  return (
    <section className={styles.container}>
      <div>
        <img src={ugixLogo} className={styles.logo_img} alt="ugix-logo" />
      </div>
      <h2 className={styles.heading}>Login to GDI Account</h2>
      <p className={styles.description}>
        Please complete your login in the opened tab/popup to get access to the
        canvas. In case, a new tab has not opened, please enable the browser to
        open popups from this website.
      </p>
    </section>
  );
}

export default Home;
