import Keycloak from 'keycloak-js';
import ugixLogo from '../../assets/images/UGIX-logo.svg';
import styles from './styles.module.css';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const isRun = useRef(false);
  const windowref = useRef<Window | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isRun.current) return;
    isRun.current = true;
    console.log('page reloaded');
    const keycloak = new Keycloak({
      url: 'https://keycloak-update.iudx.io/auth/',
      realm: 'demo',
      clientId: 'angular-iudx-client',
    });
    keycloak
      .init({
        onLoad: 'check-sso',
      })
      .then((authenticated) => {
        console.log(authenticated);
        if (authenticated) {
          navigate('/canvas');
        } else {
          handleLogin();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function handleLogin() {
    windowref.current = window.open('https://catalogue.iudx.io/auth', '_blank');

    setInterval(() => {
      checkLoginStatus();
    }, 1000);
  }

  function checkLoginStatus() {
    const keycloak = new Keycloak({
      url: 'https://keycloak-update.iudx.io/auth/',
      realm: 'demo',
      clientId: 'angular-iudx-client',
    });
    keycloak.init({
      onLoad: 'check-sso',
    });
  }
  return (
    <section className={styles.container}>
      <div>
        <img src={ugixLogo} className={styles.logo_img} alt="ugix-logo" />
      </div>
      <h2>Login to IUDX Account</h2>
      <p className={styles.description}>
        Please complete your login in the opened tab/popup to get access to the
        canvas. In case, a new tab has not opened, please enable the browser to
        open popups from this website.
      </p>
    </section>
  );
}

export default Home;
