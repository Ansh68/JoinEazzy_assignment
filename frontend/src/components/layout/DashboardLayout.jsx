import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

// Shell for every logged-in page: sidebar + top bar + the current page.
export function DashboardLayout() {
  const { pathname } = useLocation();

  // The mobile menu remembers the page it was opened on, so navigating
  // to another page closes it without needing an effect.
  const [menuOpenedOn, setMenuOpenedOn] = useState(null);
  const menuOpen = menuOpenedOn === pathname;

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar open={menuOpen} onClose={() => setMenuOpenedOn(null)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setMenuOpenedOn(pathname)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
