import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';

export const ForgotPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  return (
    <AuthCard
      key="forgot_password"
      initialMode="forgot_password"
      redirectUrl={redirectUrl}
      isModal={false}
    />
  );
};
