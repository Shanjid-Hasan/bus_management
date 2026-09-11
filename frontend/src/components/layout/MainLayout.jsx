import React, { useState } from 'react';
import AppBar from '../common/AppBar';
import NavigationDrawer from '../common/NavigationDrawer';

/**
 * Main Layout wrapper providing consistent App Bar, Navigation Drawer, and responsive viewport
 */
export const MainLayout = ({ children, maxWidth = '1200px' }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Top App Bar */}
      <AppBar onToggleDrawer={() => setDrawerOpen((prev) => !prev)} />

      {/* Side Navigation Drawer */}
      <NavigationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Main Content Area */}
      <main className="app-main-content" style={{ maxWidth }}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
