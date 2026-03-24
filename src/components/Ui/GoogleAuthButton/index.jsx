import { useGoogleLogin } from '@react-oauth/google';
import { ReactComponent as GoogleIcon } from "../../../assets/svg/google-icon.svg"
import Loader from "../Loading";
import "./GoogleAuthButton.scss";
import { useState } from 'react';

const GoogleAuthButton = ({ setGoogleToken }) => {
  const [ isLoading, setIsLoading ] = useState(false);

  const google_login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setGoogleToken(tokenResponse.access_token)
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
    onNonOAuthError: () => {
      setIsLoading(false);
    }
  });

  const login = () => {
    setIsLoading(true);
    google_login();
  }

  return (
    <button type="button" className={`google_auth_button app-transition ${isLoading ? 'google_auth_button_loading' : ''}`} onClick={ !isLoading ? login : () => {}}>
      {
        isLoading &&
          <Loader size={20}/>
      }
      <GoogleIcon style={{ visibility: isLoading ? 'hidden' : 'visible' }}/>
      <p style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
        Продолжить с Google
      </p>
    </button>
  );
};

export default GoogleAuthButton;
