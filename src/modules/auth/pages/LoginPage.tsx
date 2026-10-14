import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  return (
    <div className="w-full flex justify-center py-4">
      <AuthCard
        initialMode="login"
        redirectUrl={redirectUrl}
        isModal={false}
      />
    </div>
  );
};
