import React from 'react';

const RoleEditor = () => (
  <div className="bg-white p-6 shadow-md rounded-xl">
    <h3 className="text-lg font-semibold mb-4">Role & Permission Editor</h3>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span>Can View Dashboard</span>
        <input type="checkbox" checked />
      </div>
      <div className="flex justify-between items-center">
        <span>Can Manage Users</span>
        <input type="checkbox" />
      </div>
      <div className="flex justify-between items-center">
        <span>Can Assign Tasks</span>
        <input type="checkbox" checked />
      </div>
    </div>
  </div>
);

export default RoleEditor;