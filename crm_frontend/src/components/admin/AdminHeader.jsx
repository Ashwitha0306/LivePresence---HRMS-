import React from 'react';

const AdminHeader = ({ username }) => (
  <header className="bg-white shadow p-4 flex justify-between items-center">
    <h2 className="text-xl font-semibold">Admin Dashboard</h2>
    <div>
      <span className="text-gray-700">Welcome, {username}</span>
    </div>
  </header>
);

export default AdminHeader;