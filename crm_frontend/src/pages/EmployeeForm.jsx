import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { 
  FiCheckCircle, 
  FiClock, 
  FiUser, 
  FiChevronRight,
  FiCalendar,
  FiActivity,
  FiRefreshCw
} from 'react-icons/fi';
import TasksChart from '../components/TasksChart';
import ProfileSection from '../components/Productivity';
import ProductivityHeatmap from '../components/Productivity';
import { LoadingOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import dayjs from 'dayjs';

const EmployeeDashboard = () => {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [taskSummary, setTaskSummary] = useState({
    completed: 0,
    inProgress: 0,
    pendingReview: 0,
  });
  const [reportees, setReportees] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const refreshData = async () => {
    setLoading(true);
    setError('');
    try {
      const [employeeRes, tasksRes, reporteesRes, attendanceRes] = await Promise.all([
        axiosInstance.get(`employees/employees/${employeeId}/`),
        axiosInstance.get(`boarding/tasks/?assignee=${employeeId}`),

        axiosInstance.get(`employees/employees/${employeeId}/team/`),
        axiosInstance.get(`employees/attendance/?employee_id=${employeeId}`)
      ]);

      setEmployee(employeeRes.data);
      setLastUpdated(new Date());
      setAttendanceRecords(attendanceRes.data);

      // Process tasks
      const myTasks = tasksRes.data.filter(
        task => String(task.assignee || task.assigned_to) === String(employeeId)
      );

      // Task summary
      const summary = { completed: 0, inProgress: 0, pendingReview: 0 };
      myTasks.forEach((task) => {
        const status = task.status?.toLowerCase();
        if (status === 'completed') summary.completed++;
        else if (status === 'in_progress') summary.inProgress++;
        else if (status === 'pending_approval') summary.pendingReview++;
      });
      setTaskSummary(summary);

      // Upcoming deadlines
      const now = dayjs();
const nextWeek = now.add(7, 'day');

const upcoming = myTasks.filter(task => {
  return task.due_date && dayjs(task.due_date).isAfter(now) && dayjs(task.due_date).isBefore(nextWeek);
});

setUpcomingTasks(upcoming); 

      // Reportees
      setReportees(reporteesRes.data);
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError('Unable to refresh data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [employeeId]);

  if (loading && !employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LoadingOutlined className="text-4xl text-blue-600 dark:text-blue-400" />
        </motion.div>
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
          Loading your Dashboard...
        </p>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="text-red-500 dark:text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FiRefreshCw /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white font-sans">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-6">
        {employee?.profile_picture ? (
          <img
            src={employee.profile_picture}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-200 object-cover"
          />
        ) : (
          <div className="w-24 h-24 bg-blue-500 flex items-center justify-center text-3xl font-bold rounded-full border-4 border-white dark:border-gray-200 text-white">
            {employee?.first_name?.[0] || 'E'}
            {employee?.last_name?.[0] || ''}
          </div>
        )}
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-white dark:text-gray-100">
            Welcome, {employee.first_name} 👋
          </h1>
          <p className="text-white/80 dark:text-gray-200">{employee.email}</p>
          <p className="text-xs text-white/60 dark:text-gray-300 mt-1">
            Joined on {employee.date_of_joining || 'N/A'}
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-4 md:p-6 space-y-6">
        {/* Last Updated and Refresh Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {lastUpdated && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 ml-auto">
                <FiClock className="h-4 w-4" />
                <span>Last updated: {dayjs(lastUpdated).format('h:mm A')}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-xs hover:shadow-sm active:scale-[0.98]"
          >
            <motion.span
              animate={{ rotate: loading ? 360 : 0 }}
              transition={{ duration: 1, repeat: loading ? Infinity : 0 }}
            >
              <FiRefreshCw size={16} className={loading ? "text-blue-500" : "text-gray-600 dark:text-gray-300"} />
            </motion.span>
            <span>Refresh Data</span>
            {loading && (
              <span className="ml-1 text-xs text-blue-500 dark:text-blue-400">
                Updating...
              </span>
            )}
          </button>
        </div>

        {/* Summary Cards */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Status Card
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
                  <FiActivity className="text-2xl text-blue-500" />
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200">
                    Active
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          </motion.div> */}

          {/* Task Summary Cards */}
          {[
            {
              label: 'Completed Tasks',
              value: taskSummary.completed,
              icon: <FiCheckCircle className="text-2xl" />,
              bg: 'bg-gradient-to-br from-green-500 to-emerald-600',
              text: 'text-white',
            },
            {
              label: 'In Progress',
              value: taskSummary.inProgress,
              icon: <FiClock className="text-2xl" />,
              bg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
              text: 'text-white',
            },
            {
              label: 'Pending Reviews',
              value: taskSummary.pendingReview,
              icon: <FiUser className="text-2xl" />,
              bg: 'bg-gradient-to-br from-rose-500 to-pink-600',
              text: 'text-white',
            },
          ].map(({ label, value, icon, bg, text }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`${bg} ${text} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">{label}</span>
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  {icon}
                </div>
              </div>
              <p className="text-4xl font-bold tracking-wider">{value}</p>
              <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white/80 rounded-full" 
                  style={{ width: `${(value / (taskSummary.completed + taskSummary.inProgress + taskSummary.pendingReview || 1)) * 100}%` }}
                ></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Productivity Heatmap */}
        <ProductivityHeatmap 
          records={attendanceRecords} 
          selectedDate={selectedDate} 
        />

          {/* Profile Section
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-shadow lg:col-span-1"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600 dark:from-teal-400 dark:to-emerald-500">
                Profile Summary
              </h2>
              <div className="p-2 rounded-lg bg-teal-100/50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-300">
                <FiUser className="text-lg" />
              </div>
            </div>
            <ProfileSection employee={employee} />
          </motion.div> */}

          {/* Task Deadlines */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-shadow lg:col-span-1"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">
                Upcoming Deadlines
              </h2>
              <div className="p-2 rounded-lg bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300">
                <FiCalendar className="text-lg" />
              </div>
            </div>
            
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">No upcoming deadlines in the next week</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {upcomingTasks.map((task) => (
                  <motion.li
                    key={task.id}
                    whileHover="{{ x: 5 }}"
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">{task.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Due: {new Date(task.due_date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : task.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {task.status?.replace('_', ' ') || 'pending'}
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div> </div>

          {/* Task Chart */}
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Task Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-shadow mt-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">
                  Task Overview
                </h2>
                <div className="p-2 rounded-lg bg-purple-100/50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300">
                  <FiCheckCircle className="text-lg" />
                </div>
              </div>
              <TasksChart taskSummary={taskSummary} />
            </motion.div>

            {/* Reportees Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-shadow mt-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600 dark:from-teal-400 dark:to-emerald-500">
                  Your Reportees
                </h2>
                <div className="p-2 rounded-lg bg-purple-100/50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300">
                  <FiUser className="text-lg" />
                </div>
              </div>
              
              {reportees.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">You have no direct reportees.</p>
                </div>
              ) : (
                <ul className="grid grid-cols-1 gap-4">
                  {reportees.map((r) => (
                    <motion.li
                      key={r.employee_id}
                      whileHover={{ y: -5 }}
                      className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl shadow hover:shadow-md transition-all border border-gray-200/30 dark:border-gray-600/30"
                    >
                      <div className="flex items-center gap-4">
                        {r.profile_picture ? (
                          <motion.img
                            whileHover={{ scale: 1.05 }}
                            src={r.profile_picture}
                            alt="Reportee Avatar"
                            className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-300 shadow"
                          />
                        ) : (
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center rounded-full text-lg font-bold shadow"
                          >
                            {r.first_name?.[0] || 'U'}
                            {r.last_name?.[0] || ''}
                          </motion.div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-lg font-semibold text-gray-800 dark:text-white truncate">
                            {r.full_name || `${r.first_name} ${r.last_name}`}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{r.email}</div>
                        </div>
                        <FiChevronRight className="text-gray-400 dark:text-gray-500" />
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;   