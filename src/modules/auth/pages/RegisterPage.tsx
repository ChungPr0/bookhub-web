import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  return (
    <AuthCard
      key="register"
      initialMode="register"
      redirectUrl={redirectUrl}
      isModal={false}
    />
  );
};
