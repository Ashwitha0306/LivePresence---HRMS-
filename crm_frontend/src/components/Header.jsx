// src/components/Header.js
import React from 'react';

const Header = ({ employee }) => {
  return (
     <div className="max-w-7xl mx-auto space-y-8">
    <div className="flex justify-between items-center px-6 py-4 bg-[#1f1f1f] text-white rounded shadow">
      <div>
        <h2 className="text-xl font-semibold">
          👋 Welcome, <span className="text-blue-400">{employee?.username || 'Employee'}</span>
        </h2>
        <p className="text-sm text-gray-400">Here's your dashboard overview</p>
      </div>
      <img
        src={employee?.profile_picture || '/default-profile.png'}
        alt="Profile"
        className="w-10 h-10 rounded-full object-cover border border-gray-600"
      />
    </div>
    </div>
  );
};

export default Header; 
