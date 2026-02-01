// src/components/TeamMembers.jsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const TeamMembers = ({ employeeId }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await axiosInstance.get(`/employees/employees/${employeeId}/team/`);
        setTeamMembers(response.data);
      } catch (error) {
        console.error('Failed to load reportees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [employeeId]);

  if (loading) {
    return <div className="text-white">Loading reportees...</div>;
  }

  return (
    <div className="bg-gray-900 p-5 rounded-xl shadow-lg text-white mt-6">
      <h2 className="text-xl font-bold mb-4">Your Reportees</h2>
      {teamMembers.length === 0 ? (
        <p className="text-gray-400">You have no direct reportees.</p>
      ) : (
        <ul className="space-y-3">
          {teamMembers.map((member) => (
            <li
              key={member.employee_id}
              className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition"
            >
              <div className="font-semibold">{member.full_name}</div>
              <div className="text-sm text-gray-400">{member.designation}</div>
              <div className="text-sm text-gray-500">{member.department}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeamMembers;
