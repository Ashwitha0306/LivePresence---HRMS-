import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { FiCheckCircle, FiClock, FiUser, FiChevronRight } from 'react-icons/fi';
import TasksChart from '../components/TasksChart';
import ProfileSection from '../components/ProfileSection';
import { LoadingOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const EmployeeDashboard = () => {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [taskSummary, setTaskSummary] = useState({
    completed: 0,
    inProgress: 0,
    pendingReview: 0,
  });
  const [reportees, setReportees] = useState([]);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axiosInstance.get(`employees/employees/${employeeId}/`);
        setEmployee(res.data);
      } catch (err) {
        console.error('Failed to fetch employee:', err);
        setError('Unable to load employee data.');
      }
    };

    const fetchTasks = async () => {
      try {
        const res = await axiosInstance.get('boarding/tasks/');
        const myTasks = res.data.filter(
          (task) => String(task.assignee || task.assigned_to) === String(employeeId)
        );

        const summary = { completed: 0, inProgress: 0, pendingReview: 0 };
        myTasks.forEach((task) => {
          const status = task.status?.toLowerCase();
          if (status === 'completed') summary.completed++;
          else if (status === 'in_progress') summary.inProgress++;
          else if (status === 'pending_approval') summary.pendingReview++;
        });

        setTaskSummary(summary);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };

    const fetchReportees = async () => {
      try {
        const res = await axiosInstance.get(`employees/employees/${employeeId}/team/`);
        setReportees(res.data);
      } catch (err) {
        console.error('Failed to fetch reportees:', err);
      }
    };

    if (employeeId) {
      fetchEmployee().then(() => {
        fetchTasks();
        fetchReportees();
        setLoading(false);
      });
    }
  }, [employeeId]);

  if (loading) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="text-red-500 dark:text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white font-sans space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ scale:0.9 }}
        animate={{ scale:1}}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-600/10"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {employee?.profile_picture ? (
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              src={employee.profile_picture}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white/90 dark:border-gray-200/90 object-cover shadow-lg"
            />
          ) : (
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold rounded-full border-4 border-white/90 dark:border-gray-200/90 text-white shadow-lg"
            >
              {employee?.first_name?.[0] || 'E'}
              {employee?.last_name?.[0] || ''}
            </motion.div>
          )}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-white dark:text-gray-100">
              Welcome, {employee.first_name} <span className="animate-wiggle inline-block">👋</span>
            </h1>
            <p className="text-white/90 dark:text-gray-200">{employee.email}</p>
            <p className="text-sm text-white/70 dark:text-gray-300 mt-2">
              Joined on {new Date(employee.date_of_joining).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) || 'N/A'}
            </p>
          </div>
        </div>
      </motion.div>
      

      {/* Summary Cards */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
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

      {/* Profile + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-shadow"
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
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">
              Task Overview
            </h2>
            <div className="p-2 rounded-lg bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300">
              <FiCheckCircle className="text-lg" />
            </div>
          </div>
          <TasksChart taskSummary={taskSummary} />
        </motion.div>
      </div>

      {/* Reportees Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-shadow"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600 dark:from-purple-400 dark:to-pink-500">
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
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
  );
};

export default EmployeeDashboard;