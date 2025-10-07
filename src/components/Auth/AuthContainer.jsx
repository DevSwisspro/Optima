import React, { useState } from 'react';
import Landing from './Landing';
import Login from './Login';
import Register from './Register';
import ResetPassword from './ResetPassword';

export default function AuthContainer({ onSuccess }) {
  const [view, setView] = useState('landing'); // 'landing', 'login', 'register', 'reset'

  const handleNavigate = (newView) => {
    setView(newView);
  };

  const handleBackToLanding = () => {
    setView('landing');
  };

  const handleSuccess = () => {
    onSuccess && onSuccess();
  };

  switch (view) {
    case 'login':
      return (
        <Login
          onToggleView={handleNavigate}
          onSuccess={handleSuccess}
          onBack={handleBackToLanding}
        />
      );

    case 'register':
      return (
        <Register
          onToggleView={handleNavigate}
          onSuccess={handleSuccess}
          onBack={handleBackToLanding}
        />
      );

    case 'reset':
      return (
        <ResetPassword
          onToggleView={handleNavigate}
          onBack={handleBackToLanding}
        />
      );

    case 'landing':
    default:
      return <Landing onNavigate={handleNavigate} />;
  }
}
