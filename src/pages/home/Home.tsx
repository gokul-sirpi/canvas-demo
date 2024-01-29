import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
//
import styles from './styles.module.css';
import keycloak from '../../lib/keycloak';
import ugixLogo from '../../assets/images/gsix-logo.svg';

function Home() {
  const isRun = useRef(false);
  const windowref = useRef<Window | null>(null);
  const intervalId = useRef<number>();
  const navigate = useNavigate();

  useEffect(() => {
    if (isRun.current) return;
    isRun.current = true;
    initialiseKeycloak();
  }, []);

  function initialiseKeycloak() {
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
  }

  function handleLogin() {
    windowref.current = window.open('https://catalogue.iudx.io/auth', '_blank');
    intervalId.current = setInterval(() => {
      checkLoginStatus();
    }, 1000);
  }
  function getCookieValue(cname: string) {
    const cookies = document.cookie.split(';');
    let returnVal;
    console.log(cookies);
    for (const cookie of cookies) {
      if (!cookie) continue;
      const cookieKey = cookie.split('=')[0].trim();
      const cookieValue = cookie.split('=')[1].trim();
      if (cookieKey === cname) {
        returnVal = cookieValue;
      }
    }
    return returnVal;
  }
  function checkLoginStatus() {
    console.log('interval');
    const cookieResponse = getCookieValue('iudx-ui-sso');
    console.log(cookieResponse);
    if (cookieResponse === 'logged-in') {
      clearInterval(intervalId.current);
      closeAuthTab();
      // keycloak.login({ redirectUri: window.location.href });
      window.location.reload();
    }
  }
  function closeAuthTab() {
    if (windowref.current) {
      windowref.current.close();
    }
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
