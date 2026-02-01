import React, { useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';
import useTheme from '../../hooks/useTheme';

const AdminLayout = () => {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;