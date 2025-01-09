import { useEffect, useRef, useState } from 'react';
//
import Home from './pages/home/Home';
import Canvas from './pages/canvas/Canvas';
import keycloak from './lib/keycloak';
import envurls, { keycloakEnv } from './utils/config';
import { axiosAuthClient } from './lib/axiosConfig';
import { UserProfile } from './types/UserProfile';
import LoadingWrapper from './layouts/LoadingWrapper/LoadingWrapper';
import { AxiosError } from 'axios';
import { emitToast } from './lib/toastEmitter';
import { getCookieValue, setCookie } from './lib/cookieManger';
import Plots from './pages/plots/Plots';

function App() {
  const isRun = useRef(false);
  const windowref = useRef<Window | null>(null);
  const intervalId = useRef<number>();
  const [loggedIn, setLoggedIn] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile>();
  const [currentPage, setCurrentPage] = useState<string>(
    keycloakEnv.realm === 'adex' ? 'plots' : 'canvas'
  );

  const primaryColor = keycloakEnv.realm === 'adex' ? '#05aa99' : '#108bb0';

  document.documentElement.style.setProperty('--color-primary', primaryColor);

  const faviconUrl =
    keycloakEnv.realm === 'adex'
      ? './src/assets/images/adexFavIcon.png'
      : './src/assets/images/favicon.png';

  const favicon = document.getElementById('favicon') as HTMLLinkElement;
  function setFavicon(url: string) {
    if (favicon) {
      favicon.setAttribute('href', url);
    } else {
      console.error('Favicon element not found.');
    }
  }

  useEffect(() => {
    setFavicon(faviconUrl);
    if (isRun.current) return;
    isRun.current = true;
    // setLoggedIn(true);
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
          setCookie(envurls.authCookie, '');
          handleLogin();
        }
      })
      .catch((err: Error) => {
        console.log(err);
      });
  }

  function handleLogin() {
    windowref.current = window.open(envurls.authReduirectUrl, '_blank');
    //@ts-ignore
    intervalId.current = setInterval(() => {
      checkLoginStatus();
    }, 500);
  }
  function checkLoginStatus() {
    const cookieResponse = getCookieValue(envurls.authCookie);
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
      const response = await axiosAuthClient.get('v1/user/roles');
      if (response.status === 200 && response.data.results) {
        const user = response.data.results as UserProfile;
        if (user.roles.length > 0) {
          setProfileData(user);
          setLoggedIn(true);
        }
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        emitToast('error', error.message);
      }
    }
  }
  function changePage(newPage: string) {
    setCurrentPage(newPage);
  }
  return (
    <LoadingWrapper>
      <>
        {loggedIn && currentPage === 'canvas' && (
          <Canvas
            profileData={profileData}
            changePage={changePage}
            currentPage={currentPage}
          />
        )}
        {loggedIn && currentPage === 'plots' && (
          <Plots
            changePage={changePage}
            profileData={profileData}
            currentPage={currentPage}
          />
        )}

        {!loggedIn && <Home />}
      </>
    </LoadingWrapper>
  );
}

export default App;
