import React, { useState, useEffect } from 'react';
import { UserPortal } from './pages/UserPortal';
import { BuilderPortal } from './pages/BuilderPortal';
import { AdminLayout } from './components/admin/AdminLayout';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToUser = () => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  };

  // Route-based Page Splitting: User Discovery Map (/) vs Builder Portal (/builder) vs Superadmin Portal (/admin)
  if (currentPath.startsWith('/admin')) {
    return <AdminLayout onClose={navigateToUser} />;
  }

  if (currentPath.startsWith('/builder')) {
    return <BuilderPortal onNavigateToUser={navigateToUser} />;
  }

  return <UserPortal />;
};

export default App;
