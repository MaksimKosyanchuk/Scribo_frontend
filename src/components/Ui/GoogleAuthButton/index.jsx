import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

import GoogleIcon from "../../../assets/svg/google-icon.svg?react"

import "./GoogleAuthButton.scss";

import ActionButton from '../ActionButton/index';

const GoogleAuthButton = ({
    setGoogleToken,
    isLoading = false,
    disabled = false,
    onClickStart,
    onAuthEnd,
}) => {
  const [popupLoading, setPopupLoading] = useState(false);
  const loading = isLoading || popupLoading;

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setPopupLoading(false);
      setGoogleToken(tokenResponse.access_token)
    },
    onError: () => {
      setPopupLoading(false);
      onAuthEnd?.();
    },
    onNonOAuthError: () => {
      setPopupLoading(false);
      onAuthEnd?.();
    }
  });

  const login = () => {
    setPopupLoading(true);
    onClickStart?.();
    googleLogin();
  }

  return (
    <ActionButton isLoading={loading} disabled={disabled || loading} onClick={login} className="google_auth_button">
      <GoogleIcon/>
        Продолжить с Google
    </ActionButton>
  );
};

export default GoogleAuthButton;
