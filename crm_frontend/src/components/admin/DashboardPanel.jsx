import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CalendarDays, Clock, CheckCircle, XCircle, Loader2, Download, PlaneTakeoff, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell
} from 'recharts';
import dayjs from 'dayjs';
import useTheme from '../../hooks/useTheme';

const DashboardPanel = () => {
  const { theme } = useTheme();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenError, setTokenError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [employeeCount, setEmployeeCount] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('access');
      if (!token) {
        setTokenError(true);
        setLoading(false);
        return;
      }

      const [attendanceRes, employeesRes] = await Promise.all([
        axiosInstance.get('employees/attendance/'),
        axiosInstance.get('employees/employees/')
      ]);
      
      setAttendance(attendanceRes.data || []);
      setEmployeeCount(employeesRes.data?.length || 0);
      setLastUpdated(new Date());

      // Process weekly data
      const now = dayjs();
      const past7Days = Array.from({ length: 7 }).map((_, i) =>
        now.subtract(6 - i, 'day').format('YYYY-MM-DD')
      );

      const summary = past7Days.map(date => {
        const present = attendanceRes.data.filter(
          a => a.check_in && dayjs(a.check_in).format('YYYY-MM-DD') === date
        ).length;

        const absent = employeesRes.data?.length - present;

        return {
          day: dayjs(date).format('ddd'),
          date: dayjs(date).format('MMM D'),
          Present: present,
          Absent: absent >= 0 ? absent : 0,
          total: employeesRes.data?.length || 0
        };
      });

      setWeeklyData(summary);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const todayRecords = attendance.filter(record => 
        record.check_in && dayjs(record.check_in).format('YYYY-MM-DD') === today
      );

      const sheetData = todayRecords.map(record => ({
        'Employee Name': record.employee_name || 'N/A',
        'Employee ID': record.employee || 'N/A',
        'Check-In': record.check_in ? dayjs(record.check_in).format('YYYY-MM-DD HH:mm') : '-',
        'Check-Out': record.check_out ? dayjs(record.check_out).format('YYYY-MM-DD HH:mm') : '-',
        'Status': record.check_out ? 'Checked Out' : record.check_in ? 'Present' : 'Absent',
        'Duration (minutes)': record.check_out 
          ? dayjs(record.check_out).diff(dayjs(record.check_in), 'minutes')
          : '-'
      }));

      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Today\'s Attendance');
      
      // Add weekly summary sheet
      const weeklySummary = weeklyData.map(day => ({
        'Date': day.date,
        'Day': day.day,
        'Present': day.Present,
        'Absent': day.Absent,
        'Total Employees': day.total,
        'Attendance Rate': `${Math.round((day.Present / day.total) * 100)}%`
      }));
      const summarySheet = XLSX.utils.json_to_sheet(weeklySummary);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Weekly Summary');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const fileBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(fileBlob, `Attendance_Report_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (record) => {
    if (record.check_out) {
      return (
        <motion.span 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
            theme === 'dark' 
              ? 'bg-blue-900/50 text-blue-200 border-blue-800' 
              : 'bg-blue-100 text-blue-800 border-blue-200'
          }`}>
          <PlaneTakeoff className="mr-1 h-3 w-3" />
          Checked Out
        </motion.span>
      );
    } else if (record.check_in) {
      return (
        <motion.span 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
            theme === 'dark' 
              ? 'bg-green-900/50 text-green-200 border-green-800' 
              : 'bg-green-100 text-green-800 border-green-200'
          }`}>
          <CheckCircle className="mr-1 h-3 w-3" />
          Present
        </motion.span>
      );
    }
    return (
      <motion.span 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
          theme === 'dark' 
            ? 'bg-red-900/50 text-red-200 border-red-800' 
            : 'bg-red-100 text-red-800 border-red-200'
        }`}>
        <XCircle className="mr-1 h-3 w-3" />
        Absent
      </motion.span>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dayData = weeklyData.find(d => d.day === label);
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border shadow-lg ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700 text-white' 
              : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          <p className="font-semibold">{dayData?.date}</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Present: {payload[0].value}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span>Absent: {payload[1].value}</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm">
                <span className="font-medium">Total: </span>
                {dayData?.total} employees
              </p>
              <p className="text-sm">
                <span className="font-medium">Attendance Rate: </span>
                {Math.round((payload[0].value / dayData?.total) * 100)}%
              </p>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  if (tokenError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`flex items-center justify-center min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
      >
        <div className={`max-w-md w-full p-8 rounded-xl shadow-2xl text-center transition-all ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
          <div className="text-indigo-600 dark:text-indigo-400 text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold mb-3">Authentication Required</h2>
          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Your session has expired or you need to log in to access this dashboard
          </p>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/login'}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Go to Login
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const today = dayjs().format('YYYY-MM-DD');
  const todayAttendance = attendance.filter(
    record => record.check_in && dayjs(record.check_in).format('YYYY-MM-DD') === today
  );

  const presentCount = todayAttendance.filter(r => r.check_in).length;
  const checkedOutCount = todayAttendance.filter(r => r.check_out).length;
  const absentCount = employeeCount - presentCount;

  // Calculate attendance rate for the gauge
  const attendanceRate = employeeCount > 0 ? (presentCount / employeeCount) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`space-y-8 p-6 min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${theme === 'dark' ? 'from-indigo-300 to-purple-300' : 'from-indigo-600 to-purple-600'}`}
          >
            Employee Attendance Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`mt-1 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}
          >
            <CalendarDays className="h-4 w-4" />
            {dayjs().format('dddd, MMMM D, YYYY')}
          </motion.p>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`flex items-center gap-3 text-sm px-4 py-2 rounded-lg border backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-gray-800/50 text-gray-300 border-gray-700' 
              : 'bg-white/50 text-gray-500 border-gray-200'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Last updated: {dayjs(lastUpdated).format('h:mm A')}</span>
          <motion.button
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className={`ml-2 p-1 rounded-full ${refreshing ? 'animate-spin' : ''} ${
              theme === 'dark' 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-100'
            }`}
          >
            <RefreshCw className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg border shadow-sm flex items-start ${
              theme === 'dark' 
                ? 'bg-red-900/30 border-red-800 text-red-200' 
                : 'bg-red-100 border-red-200 text-red-800'
            }`}
          >
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium">Error fetching data</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto p-1 rounded-full hover:bg-black/10"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5 }}
          className={`flex items-center gap-4 p-6 rounded-xl shadow-lg backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-indigo-900/70 to-indigo-800/70 border border-indigo-800/50 hover:border-indigo-700' 
              : 'bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-200 hover:border-indigo-300'
          } transition-all duration-300 hover:shadow-xl`}
        >
          <div className={`p-3 rounded-full ${
            theme === 'dark' 
              ? 'bg-indigo-700/50 text-indigo-200' 
              : 'bg-indigo-100 text-indigo-600'
          }`}>
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{employeeCount}</p>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-indigo-200' : 'text-indigo-600'
            }`}>Total Employees</p>
          </div>
          <ChevronRight className="ml-auto h-5 w-5 opacity-60" />
        </motion.div>

        {/* Present Today */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -5 }}
          className={`flex items-center gap-4 p-6 rounded-xl shadow-lg backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-green-900/70 to-green-800/70 border border-green-800/50 hover:border-green-700' 
              : 'bg-gradient-to-br from-green-100 to-green-50 border border-green-200 hover:border-green-300'
          } transition-all duration-300 hover:shadow-xl`}
        >
          <div className={`p-3 rounded-full ${
            theme === 'dark' 
              ? 'bg-green-700/50 text-green-200' 
              : 'bg-green-100 text-green-600'
          }`}>
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{presentCount}</p>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-green-200' : 'text-green-600'
            }`}>Present Today</p>
          </div>
          <ChevronRight className="ml-auto h-5 w-5 opacity-60" />
        </motion.div>

        {/* Checked Out Today */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -5 }}
          className={`flex items-center gap-4 p-6 rounded-xl shadow-lg backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-blue-900/70 to-blue-800/70 border border-blue-800/50 hover:border-blue-700' 
              : 'bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 hover:border-blue-300'
          } transition-all duration-300 hover:shadow-xl`}
        >
          <div className={`p-3 rounded-full ${
            theme === 'dark' 
              ? 'bg-blue-700/50 text-blue-200' 
              : 'bg-blue-100 text-blue-600'
          }`}>
            <PlaneTakeoff className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{checkedOutCount}</p>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-blue-200' : 'text-blue-600'
            }`}>Checked Out</p>
          </div>
          <ChevronRight className="ml-auto h-5 w-5 opacity-60" />
        </motion.div>

        {/* Absent Today */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -5 }}
          className={`flex items-center gap-4 p-6 rounded-xl shadow-lg backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-red-900/70 to-red-800/70 border border-red-800/50 hover:border-red-700' 
              : 'bg-gradient-to-br from-red-100 to-red-50 border border-red-200 hover:border-red-300'
          } transition-all duration-300 hover:shadow-xl`}
        >
          <div className={`p-3 rounded-full ${
            theme === 'dark' 
              ? 'bg-red-700/50 text-red-200' 
              : 'bg-red-100 text-red-600'
          }`}>
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{absentCount >= 0 ? absentCount : 0}</p>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-red-200' : 'text-red-600'
            }`}>Absent Today</p>
          </div>
          <ChevronRight className="ml-auto h-5 w-5 opacity-60" />
        </motion.div>
      </div>

      {/* Stats and Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Rate Gauge */}
        <motion.div 
          className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white/50 border-gray-200'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Today's Attendance Rate
          </h2>
          <div className="relative h-48 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={attendanceRate > 70 ? '#10b981' : attendanceRate > 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(attendanceRate / 100) * 282.6} 282.6`}
                transform="rotate(-90 50 50)"
              />
              {/* Center text */}
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-2xl font-bold ${theme === 'dark' ? 'fill-white' : 'fill-gray-800'}`}
              >
                {Math.round(attendanceRate)}%
              </text>
              <text
                x="50"
                y="65"
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-sm ${theme === 'dark' ? 'fill-gray-300' : 'fill-gray-500'}`}
              >
                {presentCount}/{employeeCount} present
              </text>
            </svg>
          </div>
          <div className="mt-4 text-center">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
              {attendanceRate > 70 ? 'Excellent attendance!' : 
               attendanceRate > 40 ? 'Average attendance' : 'Low attendance'}
            </p>
          </div>
        </motion.div>

        {/* Weekly Attendance Chart */}
        <motion.div 
          className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm lg:col-span-2 ${
            theme === 'dark' 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white/50 border-gray-200'
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Weekly Attendance Overview
              </h2>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                Employee presence trends over the past 7 days
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Present</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Absent</span>
              </div>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barGap={4}
                barCategoryGap={16}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                  axisLine={{ stroke: theme === 'dark' ? '#374151' : '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                  axisLine={{ stroke: theme === 'dark' ? '#374151' : '#e5e7eb' }}
                  tickLine={false}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{
                    fill: theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)'
                  }}
                />
                <Bar 
                  dataKey="Present" 
                  name="Present" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                >
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-present-${index}`} fill="#10b981" />
                  ))}
                </Bar>
                <Bar 
                  dataKey="Absent" 
                  name="Absent" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                >
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-absent-${index}`} fill="#ef4444" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Today's Attendance Table */}
      <motion.div 
        className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm ${
          theme === 'dark' 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white/50 border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Today's Attendance
            </h2>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
              Showing {todayAttendance.length} check-ins for {dayjs().format('MMMM D, YYYY')}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportToExcel}
            disabled={exporting || todayAttendance.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              exporting || todayAttendance.length === 0
                ? theme === 'dark'
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export to Excel
          </motion.button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : todayAttendance.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-12 border-2 border-dashed rounded-lg ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className={`mx-auto h-16 w-16 mb-4 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <CalendarDays className="h-full w-full" />
            </div>
            <h3 className={`text-lg font-medium ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>No check-ins recorded today</h3>
            <p className={`mt-1 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>Check back later or verify your attendance system</p>
          </motion.div>
        ) : (
          <div className={`overflow-x-auto rounded-lg border shadow-xs ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <table className="min-w-full divide-y">
              <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>Employee</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>Check-In</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>Check-Out</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                theme === 'dark' 
                  ? 'divide-gray-700 bg-gray-800' 
                  : 'divide-gray-200 bg-white'
              }`}>
                {todayAttendance.map((record, index) => (
                  <motion.tr 
                    key={index} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`transition-colors duration-150 ${
                      theme === 'dark' 
                        ? 'hover:bg-gray-700/50' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center border ${
                          theme === 'dark' 
                            ? 'bg-indigo-900/50 border-indigo-800' 
                            : 'bg-indigo-100 border-indigo-200'
                        }`}>
                          <span className={theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}>
                            {record.employee_name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {record.employee_name || 'N/A'}
                          </div>
                          <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>
                            ID: {record.employee}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {record.check_in ? (
                        <span className="inline-flex items-center">
                          <Clock className="mr-1 h-3 w-3 opacity-70" />
                          {dayjs(record.check_in).format('h:mm A')}
                        </span>
                      ) : '-'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {record.check_out ? (
                        <span className="inline-flex items-center">
                          <PlaneTakeoff className="mr-1 h-3 w-3 opacity-70" />
                          {dayjs(record.check_out).format('h:mm A')}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DashboardPanel;