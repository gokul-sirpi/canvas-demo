import { useEffect, useRef, useState } from 'react';
//
import Home from './pages/home/Home';
import Canvas from './pages/canvas/Canvas';
import keycloak from './lib/keycloak';
import envurls from './utils/config';
import { axiosAuthClient } from './lib/axiosConfig';
import { UserProfile } from './types/UserProfile';
import LoadingWrapper from './layouts/LoadingWrapper/LoadingWrapper';
import { AxiosError } from 'axios';
import { emitToast } from './lib/toastEmitter';
import { getCookieValue, setCookie } from './lib/cookieManger';

function App() {
  const isRun = useRef(false);
  const windowref = useRef<Window | null>(null);
  const intervalId = useRef<number>();
  const [loggedIn, setLoggedIn] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile>();

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
      // const response = await axiosAuthClient.get('v1/user/profile');
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
  return (
    <LoadingWrapper>
      {loggedIn ? <Canvas profileData={profileData} /> : <Home />}
    </LoadingWrapper>
  );
}

export default App;
