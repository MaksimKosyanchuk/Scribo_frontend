import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

import GoogleIcon from "../../../assets/svg/google-icon.svg?react"

import "./GoogleAuthButton.scss";

import ActionButton from '../ActionButton/index';

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
    <ActionButton is_loading={isLoading} disabled={isLoading} onClick={login} className="google_auth_button">
      <GoogleIcon/>
        Продолжить с Google
    </ActionButton>
  );
};

export default GoogleAuthButton;
