import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', Completed: 40, Pending: 10 },
  { name: 'Feb', Completed: 50, Pending: 5 },
  { name: 'Mar', Completed: 60, Pending: 15 },
  { name: 'Apr', Completed: 80, Pending: 10 },
  { name: 'May', Completed: 70, Pending: 20 },
];

const EmployeeProgressChart = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 mt-6">
      <h3 className="text-xl font-semibold mb-4">Employee Task Progress</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Completed" stroke="#10b981" />
          <Line type="monotone" dataKey="Pending" stroke="#f59e0b" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmployeeProgressChart;
