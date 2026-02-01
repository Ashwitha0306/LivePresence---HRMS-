import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarStyles.css';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { 
  LoadingOutlined, 
  FireOutlined, 
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  LoginOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

const AttendanceDashboard = () => {
  // State management
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ present: 0, absent: 0, half_day: 0 });
  const [loading, setLoading] = useState(true);
  const [labelColor, setLabelColor] = useState('#000');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [todaysStatus, setTodaysStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workDuration, setWorkDuration] = useState('00:00:00');

  const employeeId = localStorage.getItem('employeeId');

  // Time and duration tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (hasCheckedIn) {
        updateWorkDuration();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [hasCheckedIn, records]);

  const updateWorkDuration = () => {
    const todayRecord = records.find(rec => rec.date === new Date().toLocaleDateString('en-CA'));
    if (todayRecord && todayRecord.check_in) {
      const checkInTime = new Date(todayRecord.check_in);
      const now = new Date();
      const diffMs = now - checkInTime;
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      setWorkDuration(
        `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`
      );
    }
  };

  // Theme detection
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    setLabelColor(isDark ? '#f1f5f9' : '#1e293b');
  }, []);

  // Data fetching and processing
  const fetchData = async (month, year) => {
    try {
      const res = await axios.get(`employees/attendance/?employee_id=${employeeId}`);
      const rawData = res.data;

      const count = { present: 0, absent: 0, half_day: 0 };
      const updatedData = rawData
        .filter((entry) => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === month && entryDate.getFullYear() === year;
        })
        .map((entry) => {
          let status = 'absent';
          if (entry.check_in && entry.check_out && entry.total_hours) {
            const hoursWorked = parseFloat(entry.total_hours);
            if (hoursWorked >= 8) status = 'present';
            else if (hoursWorked >= 4) status = 'half_day';
            //else if (new Date(entry.check_in).getHours() > 9) status = 'late';
            else status = 'absent';
          }

          count[status] += 1;
          return { ...entry, status };
        });

      setSummary(count);
      setRecords(updatedData);
      calculateStreaks(updatedData);
      checkTodaysStatus(updatedData);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Streak calculation
  const calculateStreaks = (attendanceData) => {
    let current = 0;
    let longest = 0;
    let temp = 0;
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA');
    
    const sortedData = [...attendanceData].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    sortedData.forEach(record => {
      if (record.status === 'present') {
        temp++;
        if (record.date === todayStr) {
          current = temp;
        }
        if (temp > longest) {
          longest = temp;
        }
      } else {
        temp = 0;
      }
    });

    setCurrentStreak(current);
    setLongestStreak(longest);
  };

  const checkTodaysStatus = (attendanceData) => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const todayRecord = attendanceData.find(rec => rec.date === todayStr);
    
    if (todayRecord) {
      setTodaysStatus(todayRecord.status.toLowerCase());
      setHasCheckedIn(!!todayRecord.check_in && !todayRecord.check_out);
    } else {
      setTodaysStatus(null);
      setHasCheckedIn(false);
    }
  };

  useEffect(() => {
    if (employeeId && selectedDate) {
      const month = selectedDate.getMonth();
      const year = selectedDate.getFullYear();
      fetchData(month, year);
    }
  }, [employeeId, selectedDate]);

  // Check in/out handlers
  const handleCheckIn = async () => {
    try {
      await axios.post('employees/attendance/check_in/');
      setHasCheckedIn(true);
      toast.success('Checked in successfully!', {
        icon: '🟢',
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      toast.warn(err.response?.data?.message || 'Already checked in or failed.', {
        icon: '⚠️',
      });
    }
  };

  const handleCheckOut = async () => {
    try {
      await axios.post('employees/attendance/check_out/');
      toast.success('Checked out successfully!', {
        icon: '🔴',
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed.', {
        icon: '❌',
      });
    }
  };

  // Status card configuration
  const statusCardData = {
    present: {
      bg: 'bg-green-50 dark:bg-green-700',
       border: 'border-green-200 dark:border-green-600',
       text: 'text-green-600 dark:text-green-100',
      icon: <CheckCircleOutlined className="text-green-500 text-2xl" />,
      label: 'Present'
    },
    absent: {
       bg: 'bg-red-50 dark:bg-red-700',
       border: 'border-red-200 dark:border-red-600',
       text: 'text-red-600 dark:text-red-100',
      icon: <CloseCircleOutlined className="text-red-500 text-2xl" />,
      label: 'Absent'
    },
    // late: {
    //   bg: 'bg-yellow-50 dark:bg-yellow-700',
    //    border: 'border-yellow-200 dark:border-yellow-600',
    //    text: 'text-yellow-600 dark:text-yellow-100',
    //   icon: <ClockCircleOutlined className="text-amber-500 text-2xl" />,
    //   label: 'Late'
    // },
    half_day: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200',
      icon: <span className="text-blue-500 text-2xl">½</span>,
      label: 'Half Day'
    },
    default: {
       bg: 'bg-gray-100 dark:bg-gray-700',
       border: 'border-gray-300 dark:border-gray-600',
       text: 'text-gray-700 dark:text-gray-300',
      icon: <span className="text-gray-500 text-2xl">📅</span>,
      label: 'Not Recorded'
    }
  };

  const getStatusCardProps = () => {
    return todaysStatus ? statusCardData[todaysStatus] : statusCardData.default;
  };

  // Heatmap data preparation
  const getHeatmapData = () => {
    const daysInMonth = new Date(
      selectedDate.getFullYear(), 
      selectedDate.getMonth() + 1, 
      0
    ).getDate();
    
    const heatmapData = Array(daysInMonth).fill(0);
    
    records.forEach(record => {
      const day = new Date(record.date).getDate();
      if (record.total_hours) {
        heatmapData[day - 1] = parseFloat(record.total_hours);
      }
    });

    return heatmapData;
  };

  const heatmapData = getHeatmapData();
  const maxHours = Math.max(...heatmapData, 8);

  const renderHeatmap = () => {
    return (
      <div className="grid grid-cols-7 gap-1 mt-4">
        {heatmapData.map((hours, index) => {
          const opacity = hours > 0 ? Math.min(hours / maxHours, 1) : 0.1;
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              className={`h-4 rounded-sm ${hours > 0 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
              style={{ opacity }}
              title={`Day ${index + 1}: ${hours > 0 ? `${hours} hours` : 'No data'}`}
            />
          );
        })}
      </div>
    );
  };

  // Chart configuration
  const chartData = {
    labels: ['Present', 'Absent', 'Half Day'],
    datasets: [
      {
        label: 'Attendance Summary',
        data: [summary.present, summary.absent, summary.half_day],
        backgroundColor: [
          isDarkMode ? '#10b981' : '#34d399',
          isDarkMode ? '#ef4444' : '#f43f5e',
          // isDarkMode ? '#f59e0b' : '#fde047',
          isDarkMode ? '#3b82f6' : '#60a5fa'
        ],
        borderColor: [
          isDarkMode ? '#059669' : '#10b981',
          isDarkMode ? '#dc2626' : '#e11d48',
          // isDarkMode ? '#d97706' : '#eab308',
          isDarkMode ? '#1d4ed8' : '#2563eb'
        ],
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: [
          isDarkMode ? '#059669' : '#10b981',
          isDarkMode ? '#dc2626' : '#e11d48',
          // isDarkMode ? '#d97706' : '#eab308',
          isDarkMode ? '#1d4ed8' : '#2563eb'
        ],
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: labelColor,
          font: {
            size: 14,
            weight: '500',
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        titleColor: isDarkMode ? '#f8fafc' : '#1e293b',
        bodyColor: isDarkMode ? '#e2e8f0' : '#475569',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 6,
      },
    },
    scales: {
      x: {
        ticks: { 
          color: labelColor,
          font: {
            size: 12,
          }
        },
        grid: { 
          color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(203, 213, 225, 0.5)',
          drawBorder: false,
        },
      },
      y: {
        ticks: { 
          color: labelColor,
          font: {
            size: 12,
          }
        },
        grid: { 
          color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(203, 213, 225, 0.5)',
          drawBorder: false,
        },
        beginAtZero: true,
      },
    },
  };

  // Calendar tile styling
  const getTileClass = ({ date, view }) => {
    if (view === 'month') {
      const localDateStr = date.toLocaleDateString('en-CA');
      const rec = records.find((r) => r.date === localDateStr);
      if (rec) {
        const status = rec.status.toLowerCase();
        if (status === 'present') return 'calendar-present';
        if (status === 'absent') return 'calendar-absent';
        // if (status === 'late') return 'calendar-late';
        if (status === 'half_day') return 'calendar-half-day';
      }
    }
    return null;
  };


if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <LoadingOutlined className="text-4xl text-blue-600 dark:text-blue-400" />
        </motion.div>
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
          Loading your Attendance Dashboard...
        </p>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-screen w-full p-4 md:p-8 font-sans transition-colors duration-300"
    >
      {/* Enhanced Header with Streak Counter */}
           <header className="mb-8">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                 <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                   Attendance Dashboard
                 </h1>
                 <p className="text-gray-500 dark:text-gray-400 mt-1">
                   Track and manage your daily attendance records
                 </p>
               </div>
               
               {/* Streak Counter in Header */}
               <div className="flex items-center gap-4">
                 <motion.div 
                   whileHover={{ scale: 1.05 }}
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStreak > 0 ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                 >
                   <FireOutlined className={currentStreak > 0 ? 'text-white' : 'text-gray-500'} />
                   <div className="text-center">
                     <div className="text-sm font-medium">Current Streak</div>
                     <div className="text-xl font-bold">{currentStreak} days</div>
                   </div>
                   {longestStreak > 0 && (
                     <div className="hidden sm:flex items-center gap-1 ml-2 pl-2 border-l border-white/20">
                       <TrophyOutlined className="text-yellow-300" />
                       <span className="text-xs">{longestStreak} day record</span>
                     </div>
                   )}
                 </motion.div>
               </div>
             </div>
           </header>

      {/* Top Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6 rounded-2xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold mb-2">Today's Status</h2>
              <div className="flex items-center gap-3">
                {getStatusCardProps().icon}
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusCardProps().color}`}>
                  {getStatusCardProps().label}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {hasCheckedIn && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Current Session</span>
                <span className="font-mono text-lg">{workDuration}</span>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCheckIn}
              disabled={hasCheckedIn}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex-1 flex items-center justify-center gap-2 ${
                hasCheckedIn 
                  ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <LoginOutlined />
              <span>{hasCheckedIn ? 'Checked In' : 'Check In'}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCheckOut}
              disabled={!hasCheckedIn}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex-1 flex items-center justify-center gap-2 ${
                !hasCheckedIn 
                  ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              <LogoutOutlined />
              <span>Check Out</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Streak Counter */}
        {/* <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-orange-500 to-pink-500 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-pink-600/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Current Streak</h2>
              <FireOutlined className="text-2xl" />
            </div>
            
            <div className="flex items-end gap-4">
              <div className="text-5xl font-bold">{currentStreak}</div>
              <div className="text-sm opacity-90">days in a row</div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="flex justify-between items-center">
                <div className="text-sm opacity-90">Longest streak</div>
                <div className="flex items-center gap-1">
                  <TrophyOutlined />
                  <span className="font-medium">{longestStreak} days</span>
                </div>
              </div>
            </div>
          </div>

          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-4 right-4 text-xl"
          >
            {currentStreak > 3 ? '🔥' : '✨'}
          </motion.div>
        </motion.div> */}

        {/* Productivity Heatmap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-6 rounded-2xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold mb-2">
            {selectedDate.toLocaleString('default', { month: 'long' })} Productivity
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Darker cells indicate more hours worked
          </p>
          
          {renderHeatmap()}
          
          <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>0h</span>
            <span>{Math.floor(maxHours/2)}h</span>
            <span>{maxHours}h</span>
          </div>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        {[
          ['Present', summary.present, 'bg-green-50 dark:bg-green-700 border-green-200 dark:border-green-600 text-green-600 dark:text-green-100', <CheckCircleOutlined className="text-green-500 text-2xl" />],
          ['Absent', summary.absent, 'bg-red-50 dark:bg-red-700 border-red-200 dark:border-red-600 text-red-600 dark:text-red-100', <CloseCircleOutlined className="text-red-500 text-2xl" />],
          // ['Late', summary.late, 'bg-yellow-50 dark:bg-yellow-700 border-yellow-200 dark:border-yellow-600 text-yellow-600 dark:text-yellow-100', <ClockCircleOutlined className="text-amber-500 text-2xl" />],
          ['Half Day', summary.half_day, 'bg-blue-50 dark:bg-blue-700 border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-100', <span className="text-blue-500 text-2xl">½</span>],
        ].map(([title, value, cardClass, icon], index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -5 }}
            className={`p-6 rounded-xl shadow transition-all duration-300 ease-in-out ${cardClass}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium">{title}</p>
                <motion.p 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="text-3xl font-bold mt-2"
                >
                  {value}
                </motion.p>
              </div>
              <div className="text-3xl">
                {icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart + Calendar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        {/* Monthly Attendance Summary */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="p-5 rounded-2xl shadow bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Monthly Attendance Summary
            </h2>
            <span className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
              {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="w-full h-64">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Attendance Calendar */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="p-5 rounded-2xl shadow bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Attendance Calendar
          </h2>
          <div className="mb-4 flex flex-wrap gap-3">
            {[
              ['Present', 'bg-green-400', 'Present days'],
              ['Absent', 'bg-red-400', 'Absent days'],
              // ['Late', 'bg-amber-400', 'Late days'],
              ['Half Day', 'bg-blue-400', 'Half days'],
            ].map(([label, color, title], index) => (
              <motion.span 
                key={label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                title={title}
                className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <div className={`w-3 h-3 ${color} rounded-full`} /> {label}
              </motion.span>
            ))}
          </div>
          <Calendar
            tileClassName={getTileClass}
            onActiveStartDateChange={({ activeStartDate }) => {
              setSelectedDate(activeStartDate);
            }}
            className="REACT-CALENDAR p-2 border border-gray-200 dark:border-gray-700 rounded-xl w-full text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800"
          />
        </motion.div>
      </motion.div>

      {/* Attendance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-5 rounded-2xl shadow bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex justify-between items-center mb-4 ">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Attendance Records
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {records.length} records found
          </span>
        </div>
<div className="w-full rounded-lg border border-gray-200 dark:border-gray-700">
   <div className="p-2 max-h-60 overflow-y-auto custom-scroll">  
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {['Date', 'Status', 'Check-In', 'Check-Out', 'Hours'].map((header, index) => (
                  <motion.th
                    key={header}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {header}
                  </motion.th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {records.length > 0 ? (
                  records.map((rec, index) => {
                    const checkInDate = rec.check_in ? new Date(rec.check_in) : null;
                    const checkOutDate = rec.check_out ? new Date(rec.check_out) : null;
                    
                    const statusColor = {
                      present: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                      absent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                      // late: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
                      half_day: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                    }[rec.status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

                    return (
                      <motion.tr
                        key={rec.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.03 }}
                        whileHover={{ scale: 1.005, backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 0.5)' }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {rec.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.span 
                            whileHover={{ scale: 1.05 }}
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}
                          >
                            {rec.status}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {checkInDate ? (
                            <>
                              <div>{checkInDate.toLocaleDateString()}</div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                {checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {checkOutDate ? (
                            <>
                              <div>{checkOutDate.toLocaleDateString()}</div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                {checkOutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {rec.total_hours || '—'}
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <motion.div 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500"
                      >
                        <svg
                          className="w-12 h-12 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <p className="text-lg">No attendance records found</p>
                        <p className="text-sm mt-1">Your records will appear here once available</p>
                      </motion.div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
          </div>
        </div>
      </motion.div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"}
        toastStyle={{
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      />
    </motion.div>
  );
};

export default AttendanceDashboard;