import Home from './pages/home/Home';
import Canvas from './pages/canvas/Canvas';
import { useEffect, useRef, useState } from 'react';
import keycloak from './lib/keycloak';
import envurls from './utils/config';
import { axiosAuthClient } from './lib/axiosConfig';
import { UserProfile } from './types/UserProfile';

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
        const user = response.data.results as UserProfile;
        if (user.roles.length > 0) {
          setProfileData(user);
          setLoggedIn(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  return <>{loggedIn ? <Canvas profileData={profileData} /> : <Home />}</>;
}

export default App;
