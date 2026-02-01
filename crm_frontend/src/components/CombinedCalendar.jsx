import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from '../api/axiosInstance';
import './CalendarStyles.css'; // retains custom status styles like calendar-present

const CombinedCalendar = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const employeeId = localStorage.getItem('employeeId');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`employees/attendance/?employee_id=${employeeId}`);
        setAttendanceData(res.data);
      } catch (err) {
        console.error('Error fetching calendar data:', err);
      }
    };

    if (employeeId) fetchAttendance();
  }, [employeeId]);

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return;

    const dStr = date.toISOString().split('T')[0];
    const match = attendanceData.find((record) => record.date === dStr);

    if (match) {
      const status = match.status.toLowerCase();
      if (status === 'present') return 'calendar-present';
      if (status === 'absent') return 'calendar-absent';
      if (status === 'late') return 'calendar-late';
    }
  };

  return (
    <div className="w-full min-h-screen p-6 flex flex-col items-center bg-gray-100 dark:bg-[#0f172a]">
      <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Attendance Calendar</h2>

      {/* Legend */}
      <div className="flex space-x-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 rounded-full"></div>
          <span className="text-sm text-gray-800 dark:text-slate-200">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 rounded-full"></div>
          <span className="text-sm text-gray-800 dark:text-slate-200">Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-300 rounded-full"></div>
          <span className="text-sm text-gray-800 dark:text-slate-200">Late</span>
        </div>
      </div>

      {/* Calendar container with theme-based bg */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow w-full max-w-4xl border border-gray-200 dark:border-slate-700">
        <Calendar
          tileClassName={tileClassName}
          className="w-full rounded-lg calendar-theme"
        />
      </div>
    </div>
  );
};

export default CombinedCalendar;
