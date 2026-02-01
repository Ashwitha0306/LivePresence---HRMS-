// src/components/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex min-h-screen h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-[#f2f2f2] overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
