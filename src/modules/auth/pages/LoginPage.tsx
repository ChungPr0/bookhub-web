import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  return (
    <AuthCard
      key="login"
      initialMode="login"
      redirectUrl={redirectUrl}
      isModal={false}
    />
  );
};
