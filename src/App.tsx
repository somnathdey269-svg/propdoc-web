import React, { useState, useEffect } from 'react';
import { UserPortal } from './pages/UserPortal';
import { BuilderPortal } from './pages/BuilderPortal';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToBuilder = () => {
    window.history.pushState({}, '', '/builder');
    setCurrentPath('/builder');
  };

  const navigateToUser = () => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  };

  // Route-based Page Splitting: User Discovery Map (/) vs Builder Portal (/builder)
  if (currentPath.startsWith('/builder')) {
    return <BuilderPortal onNavigateToUser={navigateToUser} />;
  }

  return <UserPortal onNavigateToBuilder={navigateToBuilder} />;
};

export default App;
