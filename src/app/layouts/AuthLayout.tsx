import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthShell } from '@/modules/auth/components/AuthShell';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
      <AuthShell isModal={false}>
        <Outlet />
      </AuthShell>
    </div>
  );
};
