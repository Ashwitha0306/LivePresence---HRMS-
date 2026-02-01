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
  FiRefreshCw,
  FiAward,
  FiTrendingUp,
  FiBarChart2
} from 'react-icons/fi';
import TasksChart from '../components/TasksChart';
import ProductivityHeatmap from '../components/Productivity';
import { LoadingOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

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
    cancelled: 0
  });
  const [reportees, setReportees] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

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

    // Calculate task summary counts
    const allTasks = tasksRes.data;
    const summary = {
      completed: allTasks.filter(t => t.status?.toLowerCase() === 'completed').length,
      inProgress: allTasks.filter(t => t.status?.toLowerCase() === 'in_progress').length,
      pendingReview: allTasks.filter(t => t.status?.toLowerCase() === 'pending_approval').length,
      cancelled: allTasks.filter(t => t.status?.toLowerCase() === 'cancelled').length
    };
    setTaskSummary(summary);

    // Upcoming tasks (within next 7 days, not completed)
    const now = dayjs();
    const nextWeek = now.add(7, 'day');
    const upcoming = allTasks
      .filter(task =>
        task.due_date &&
        dayjs(task.due_date).isAfter(now) &&
        dayjs(task.due_date).isBefore(nextWeek) &&
        task.status?.toLowerCase() !== 'completed'
      )
      .sort((a, b) => dayjs(a.due_date) - dayjs(b.due_date));

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-center space-y-4">
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
       <div className="max-w-[1500px] mx-auto space-y-8 ml-24">
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

      {/* Main Content */}
      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Completed Tasks',
              value: taskSummary.completed,
              icon: <FiCheckCircle className="text-xl" />,
      bg: 'bg-green-50 dark:bg-green-700',
      border: 'border-green-200 dark:border-green-600',
      text: 'text-black dark:text-white',
              trend: taskSummary.completed > 0 ? 'up' : 'neutral'
            },
            {
              label: 'In Progress',
              value: taskSummary.inProgress,
              icon: <FiClock className="text-xl" />,
      bg: 'bg-yellow-50 dark:bg-yellow-700',
      border: 'border-yellow-200 dark:border-yellow-600',
      text: 'text-black dark:text-white',
              trend: taskSummary.inProgress > 0 ? 'up' : 'neutral'
            },
            {
              label: 'Pending Review',
              value: taskSummary.pendingReview,
              icon: <FiUser className="text-xl" />,
      bg: 'bg-blue-50 dark:bg-blue-700',
      border: 'border-blue-200 dark:border-blue-600',
      text: 'text-black dark:text-white',
              trend: taskSummary.pendingReview > 0 ? 'up' : 'neutral'
            },
            {
              label: 'Cancelled',
              value: taskSummary.cancelled,
              icon: <FiCalendar className="text-xl" />,
      bg: 'bg-red-50 dark:bg-red-700',
      border: 'border-red-200 dark:border-red-600',
      text: 'text-black dark:text-white',
              trend: taskSummary.cancelled > 0 ? 'down' : 'neutral'
            }
          ].map(({ label, value, icon, bg, text, border, trend }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`${bg} ${border} ${text} p-5 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                  <p className="text-3xl font-semibold">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${bg.replace('50', '100')} dark:${bg.replace('/20', '/30')}`}>
                  {icon}
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs">
                {trend === 'up' && (
                  <span className="flex items-center text-green-600 dark:text-green-400">
                    <FiTrendingUp className="mr-1" /> Increased
                  </span>
                )}
                {trend === 'down' && (
                  <span className="flex items-center text-red-600 dark:text-red-400">
                    <FiTrendingUp className="mr-1 transform rotate-180" /> Increased
                  </span>
                )}
                {trend === 'neutral' && (
                  <span className="text-gray-500 dark:text-gray-400">No change</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Productivity Heatmap */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Productivity Heatmap
                </h2>
                <div className="flex items-center space-x-2">
                  <button 
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-md"
                    onClick={() => setSelectedDate(dayjs().subtract(1, 'month').toDate())}
                  >
                    Last Month
                  </button>
                  <button 
                    className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Current
                  </button>
                </div>
              </div>
              <ProductivityHeatmap 
                records={attendanceRecords} 
                selectedDate={selectedDate} 
              />
            </motion.div>

            {/* Task Overview */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Task Overview
                </h2>
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300">
                  <FiBarChart2 className="text-lg" />
                </div>
              </div>
              <TasksChart taskSummary={taskSummary} />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Upcoming Deadlines
                </h2>
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300">
                  <FiCalendar className="text-lg" />
                </div>
              </div>
              
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">No upcoming deadlines in the next week</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {upcomingTasks.slice(0, 5).map((task) => (
                    <motion.li
                      key={task.id}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{task.name}</h3>
                        <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <FiCalendar className="mr-1" />
                          <span>
                            Due {dayjs(task.due_date).format('MMM D')}
                          </span>
                        </div>
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
              {upcomingTasks.length > 5 && (
                <button className="mt-4 w-full text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View all ({upcomingTasks.length})
                </button>
              )}
            </motion.div>

            {/* Team Members */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Your Team
                </h2>
                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-300">
                  <FiUser className="text-lg" />
                </div>
              </div>
              
              {reportees.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">You have no direct reportees.</p>
                </div>
              ) : (
                <>
                  <ul className="space-y-3">
                    {reportees.slice(0, 3).map((r) => (
                      <motion.li
                        key={r.employee_id}
                        whileHover={{ y: -2 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer"
                      >
                        {r.profile_picture ? (
                          <img
                            src={r.profile_picture}
                            alt="Reportee Avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-300"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center rounded-full text-sm font-bold">
                            {r.first_name?.[0] || 'U'}
                            {r.last_name?.[0] || ''}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                            {r.full_name || `${r.first_name} ${r.last_name}`}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {r.email || 'No mail id provided'}
                          </p>
                        </div>
                        <FiChevronRight className="text-gray-400 dark:text-gray-500" />
                      </motion.li>
                    ))}
                  </ul>
                  {reportees.length > 3 && (
                    <button className="mt-4 w-full text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      View all team members ({reportees.length})
                    </button>
                  )}
                </>
              )}
            </motion.div>

            {/* Recent Achievements */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Recent Achievements
                </h2>
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300">
                  <FiAward className="text-lg" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                    <FiCheckCircle />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                      Completed onboarding tasks
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {taskSummary.completed} tasks completed this month
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <FiTrendingUp />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                      Productivity increase
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      15% more productive than last month
                    </p>
                  </div>
                </div>
              </div>
              <button className="mt-4 w-full text-sm text-blue-600 dark:text-blue-400 hover:underline">
                View all achievements
              </button>
            </motion.div>
          </div>
        </div>
      </main>
    </div></div></div>
  );
};

export default EmployeeDashboard;