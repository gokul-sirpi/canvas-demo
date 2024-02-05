import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
//
import styles from './styles.module.css';
import keycloak from '../../lib/keycloak';
import ugixLogo from '../../assets/images/gsix-logo.svg';
import { axiosAuthClient } from '../../lib/axiosConfig';
import envurls from '../../utils/config';

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
      .then((authenticated: boolean) => {
        if (authenticated) {
          checkUserProfile();
        } else {
          setCookie('gsx-ui-sso', '');
          handleLogin();
        }
      })
      .catch((err: Error) => {
        console.log(err);
      });
  }

  function setCookie(key: string, val: string) {
    document.cookie = `${key}=${val};domain=iudx.io`;
  }

  function handleLogin() {
    windowref.current = window.open(envurls.authReduirectUrl, '_blank');
    intervalId.current = setInterval(() => {
      checkLoginStatus();
    }, 500);
  }

  function getCookieValue(cname: string) {
    const cookies = document.cookie.split(';');
    let returnVal;
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
    const cookieResponse = getCookieValue('gsx-ui-sso');
    if (cookieResponse === 'logged-in') {
      clearInterval(intervalId.current);
      closeAuthTab();
      window.location.reload();
    }
  }

  function closeAuthTab() {
    if (windowref.current) {
      windowref.current.close();
    }
  }

  async function checkUserProfile() {
    try {
      const response = await axiosAuthClient.get('v1/user/profile');
      if (response.status === 200 && response.data.results) {
        if (response.data.results.roles.length > 0) {
          navigate('/canvas');
        }
      }
    } catch (error) {
      console.log(error);
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
