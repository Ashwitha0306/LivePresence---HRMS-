// src/components/OverviewCard.jsx
import React from 'react';

const OverviewCard = ({ title, value, icon, color }) => {
  return (
    <div className={`p-5 rounded-lg shadow-md ${color} text-white w-full`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold">{title}</h4>
        <span>{icon}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default OverviewCard;
