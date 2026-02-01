import React from 'react';

const DashboardHome = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card title="Total Users" value="320" />
    <Card title="Active Employees" value="280" />
    <Card title="Pending Tasks" value="15" />
    <Card title="Leave Requests" value="6" />
  </div>
);

const Card = ({ title, value }) => (
  <div className="bg-white shadow-md rounded-xl p-6">
    <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

export default DashboardHome;