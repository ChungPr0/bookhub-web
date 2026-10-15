import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthModalStore } from '../store/useAuthModalStore';
import { AuthCard } from './AuthCard';
import { AuthShell } from './AuthShell';

export const AuthModal: React.FC = () => {
  const isOpen = useAuthModalStore((state) => state.isOpen);
  const mode = useAuthModalStore((state) => state.mode);
  const redirectUrl = useAuthModalStore((state) => state.redirectUrl);
  const onSuccessCallback = useAuthModalStore((state) => state.onSuccessCallback);
  const closeModal = useAuthModalStore((state) => state.closeModal);
  const navigate = useNavigate();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    },
    [closeModal]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    if (onSuccessCallback) {
      onSuccessCallback();
    } else if (redirectUrl) {
      navigate(redirectUrl, { replace: true });
    }
    closeModal();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm auth-modal-overlay overflow-y-auto"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-[960px] my-auto auth-modal-container">
        <AuthShell isModal={true} onClose={closeModal}>
          <AuthCard
            initialMode={mode}
            onSuccess={handleSuccess}
            onClose={closeModal}
            redirectUrl={redirectUrl}
            isModal={true}
          />
        </AuthShell>
      </div>
    </div>
  );
};
