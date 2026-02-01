import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axiosInstance';
import {
  FiCheckCircle,
  FiClock,
  FiUser,
  FiCalendar,
  FiList,
  FiPlay,
  FiStopCircle,
  FiRefreshCw,
  FiX,
  FiAlertTriangle,
  FiClipboard,
  FiSearch,
  FiDownload,
  FiChevronRight,
  FiFilter,
  FiTag
} from 'react-icons/fi';
import TaskTimeLogTable from './TaskTimeLogTable';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const cardHoverVariants = {
  hover: { 
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
};

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [timeLogs, setTimeLogs] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
const [activeTimer, setActiveTimer] = useState(null); // Track currently active timer
const [timeLogsForSelectedTask, setTimeLogsForSelectedTask] = useState([]);
const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  // Status and priority configurations with enhanced styling
  const statusConfig = {
    not_started: {
      bg: 'bg-gray-100 dark:bg-gray-700',
      border: 'border-gray-300 dark:border-gray-600',
      text: 'text-gray-700 dark:text-gray-300',
      icon: <FiList className="h-4 w-4 mr-2" />,
      label: 'Not Started',
    },
    in_progress: {
      bg: 'bg-blue-50 dark:bg-blue-700',
      border: 'border-blue-200 dark:border-blue-600',
      text: 'text-blue-600 dark:text-blue-100',
      icon: <FiRefreshCw className="h-4 w-4 mr-2 animate-spin" />,
      label: 'In Progress',
    },
    pending_approval: {
      bg: 'bg-yellow-50 dark:bg-yellow-700',
      border: 'border-yellow-200 dark:border-yellow-600',
      text: 'text-yellow-600 dark:text-yellow-100',
      icon: <FiAlertTriangle className="h-4 w-4 mr-2" />,
      label: 'Pending Approval',
    },
    completed: {
      bg: 'bg-green-50 dark:bg-green-700',
      border: 'border-green-200 dark:border-green-600',
      text: 'text-green-600 dark:text-green-100',
      icon: <FiCheckCircle className="h-4 w-4 mr-2" />,
      label: 'Completed',
    },
    cancelled: {
      bg: 'bg-red-50 dark:bg-red-700',
      border: 'border-red-200 dark:border-red-600',
      text: 'text-red-600 dark:text-red-100',
      icon: <FiX className="h-4 w-4 mr-2" />,
      label: 'Cancelled',
    },
  };

  const priorityConfig = {
    high: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-300 dark:border-red-700',
      text: 'text-red-700 dark:text-red-400',
      icon: '🔥',
      label: 'High Priority',
    },
    medium: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      border: 'border-yellow-300 dark:border-yellow-700',
      text: 'text-yellow-700 dark:text-yellow-400',
      icon: '⚠️',
      label: 'Medium Priority',
    },
    low: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-300 dark:border-green-700',
      text: 'text-green-700 dark:text-green-400',
      icon: '✅',
      label: 'Low Priority',
    },
  };

  const employeeId = localStorage.getItem('employeeId');

  const filteredTasks = tasks.filter((task) => {
    const matchesAssignee = String(task.assignee) === String(employeeId);
    const matchesTab = activeTab === 'all' || task.status === activeTab;
    const matchesSearch =
      task.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAssignee && matchesTab && matchesSearch;
  });

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/boarding/tasks/');
      const enriched = res.data.map((task) => ({
        ...task,
        status: task.status?.toLowerCase() || 'not_started',
        priority: task.priority?.toLowerCase() || 'medium',
      }));
      setTasks(enriched);
    } catch (err) {
      console.error('Failed to load tasks:', err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

const startTimer = async (taskId) => {
  try {
    const task = tasks.find((t) => t.id === taskId);
    if (task?.status === 'not_started') {
      await axios.patch(`/boarding/tasks/${taskId}/`, { status: 'in_progress' });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: 'in_progress' } : t))
      );
    }
    const res = await axios.post('/employees/task-time-logs/start_time/', { task_id: taskId });
    setTimeLogs((prev) => ({ ...prev, [taskId]: res.data }));
    setActiveTimer(taskId); // Set the active timer
    fetchTasks();
  } catch (err) {
    console.error('Start timer failed:', err);
  }
};

 const stopTimer = async (logId, taskId) => {
  try {
    await axios.post(`/employees/task-time-logs/${logId}/end_time/`);
    setTimeLogs((prev) => {
      const updated = { ...prev };
      delete updated[taskId];
      return updated;
    });
    // setActiveTimer(null); // Clear active timer
    fetchTasks();
    
  } catch (err) {
    console.error('Stop timer failed:', err);
  }
};

useEffect(() => {
  // Load active timer from localStorage on component mount
  const savedTimer = localStorage.getItem('activeTimer');
  if (savedTimer) {
    setActiveTimer(JSON.parse(savedTimer));
  }

  // Save active timer to localStorage whenever it changes
  return () => {
    if (activeTimer) {
      localStorage.setItem('activeTimer', JSON.stringify(activeTimer));
    } else {
      localStorage.removeItem('activeTimer');
    }
  };
}, [activeTimer]);

useEffect(() => {
  // Fetch time logs for active timer if it exists
  const fetchActiveTimerLog = async () => {
    if (activeTimer && !timeLogs[activeTimer]) {
      try {
        const res = await axios.get(`/employees/task-time-logs/?task=${activeTimer}&is_running=true`);
        if (res.data.length > 0) {
          setTimeLogs((prev) => ({ ...prev, [activeTimer]: res.data[0] }));
        }
      } catch (err) {
        console.error('Failed to fetch active timer:', err);
      }
    }
  };
  fetchActiveTimerLog();
}, [activeTimer]);
// Add this effect to fetch logs when a task is selected
useEffect(() => {
  const fetchLogsForSelectedTask = async () => {
    if (selectedTask) {
      setIsLoadingLogs(true);
      try {
        const res = await axios.get(`/employees/task-time-logs/?task=${selectedTask.id}`);
        setTimeLogsForSelectedTask(res.data);
      } catch (err) {
        console.error('Failed to load time logs:', err);
      } finally {
        setIsLoadingLogs(false);
      }
    }
  };
  
  fetchLogsForSelectedTask();
}, [selectedTask]);

// Calculate total hours for the selected task
const totalHoursForSelectedTask = timeLogsForSelectedTask.reduce(
  (total, log) => total + (parseFloat(log.hours_spent) || 0), 0
);

  const updateTaskStatus = async (taskId, status) => {
    try {
      const employeeId = localStorage.getItem('employeeId');
      const payload = { status };
      if (status === 'completed') {
        payload.completion_date = new Date().toISOString().split('T')[0];
        payload.completed_by = employeeId;
      }
      await axios.patch(`/boarding/tasks/${taskId}/`, payload);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...payload } : t))
      );
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const openModal = (task) => {
    setSelectedTask(task);
    setIsModalVisible(true);
  };

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setTimeout(() => setSelectedTask(null), 300);
  }, []);
  

  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && closeModal();
    if (isModalVisible) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalVisible, closeModal]);

  useEffect(() => {
    fetchTasks();
  }, []);

   return (
    <div  className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-screen w-full p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-[1500px] mx-auto space-y-8 ml-16">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Task Dashboard
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
              <FiClipboard className="h-5 w-5" /> Manage and track your assigned tasks
            </p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={fetchTasks}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <FiRefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="font-medium">Refresh</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Search and Stats Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Search Box */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tasks by name or description..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition duration-200 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks Assigned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tasks.filter(t => String(t.assignee) === String(employeeId)).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                <FiClipboard className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Status Overview Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {Object.entries(statusConfig).map(([status, cfg]) => (
            <motion.div
              key={status}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              className={`rounded-xl p-4 border ${cfg.border} ${cfg.bg} shadow-sm flex flex-col items-start transform transition duration-200 hover:shadow-md`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-sm font-semibold dark:text-gray-200">{cfg.label}</span>
                {cfg.icon}
              </div>
              <p className={`text-4xl font-bold mt-1 ${cfg.text}`}>
                {tasks.filter((t) => String(t.assignee) === String(employeeId) && t.status === status).length}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tab Navigation for Filtering Tasks */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-5 mt-8 border-b border-gray-200 dark:border-gray-700 pb-3"
        >
          {['all', ...Object.keys(statusConfig)].map((tab) => {
            const isAllTab = tab === 'all';
            const tabLabel = isAllTab ? 'All Tasks' : statusConfig[tab]?.label;
            const tabIcon = isAllTab ? <FiFilter className="h-4 w-4 mr-2" /> : statusConfig[tab]?.icon;

            const baseClasses = "px-5 py-2 rounded-lg text-sm font-medium transition duration-300 ease-in-out flex items-center shadow-sm";
            const activeClasses = "bg-teal-500 dark:bg-teal-700 text-white";
            const inactiveClasses = "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700";

            return (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab)}
                className={`${baseClasses} ${activeTab === tab ? activeClasses : inactiveClasses}`}
              >
                {tabIcon} {tabLabel}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Task Cards Grid */}
        {filteredTasks.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 hover:shadow-md"
          >
            {filteredTasks.map((task) => {
              const status = statusConfig[task.status];
              const priority = priorityConfig[task.priority];
              const activeLog = timeLogs[task.id];

              return (
                <motion.div
                  key={task.id}
                  variants={itemVariants}
                  whileHover="hover"
                  onClick={() => openModal(task)}
                  className={`cursor-pointer rounded-xl p-5 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group border ${status.border}`}
                >
                      {/* Animated status indicator */}
                                    <motion.div 
                                      className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-${status.color}-500 transition-opacity duration-300`}
                                      initial={{ opacity: 0 }}
                                      whileHover={{ opacity: 0.1 }}
                                    />
                                    
                                    {/* Status ribbon */}
                                    <motion.div 
                                      className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold ${status.text} ${status.bg} rounded-bl-lg rounded-tr-lg`}
                                      whileHover={{ scale: 1.05 }}
                                    >
                                      {status.label}
                                    </motion.div>

                  <div className="relative z-10">
                    <h2 className={`text-lg font-bold mb-2 text-gray-800 dark:text-white`}>
                      {task.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {task.description}
                    </p>

                    {/* Priority and metadata */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${priority.bg} ${priority.text} flex items-center gap-1`}>
                        {priority.icon} {priority.label}
                      </span>
                      {task.due_date && (
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-1">
                          <FiCalendar className="h-3 w-3" /> Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                      {task.status !== 'completed' && task.status !== 'cancelled' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-md shadow-sm transition-all duration-200 flex items-center gap-1 font-medium"
                        >
                          <FiCheckCircle className="h-3 w-3" /> Complete
                        </motion.button>
                      )}
                      {task.status !== 'completed' && task.status !== 'cancelled' && task.status!=='pending_approval' &&(
                        !activeLog ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startTimer(task.id)}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md shadow-sm transition-all duration-200 flex items-center gap-1 font-medium"
                          >
                            <FiPlay className="h-3 w-3" /> Start
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => stopTimer(activeLog.id, task.id)}
                            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs rounded-md shadow-sm transition-all duration-200 flex items-center gap-1 font-medium"
                          >
                            <FiStopCircle className="h-3 w-3" /> Stop
                          </motion.button>
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <motion.div 
              animate={{ 
                rotate: [0, 5, -5, 5, 0],
                y: [0, -5, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500 mb-4"
            >
              <FiClipboard className="h-full w-full" />
            </motion.div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No tasks found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'Try a different search term' : 'You currently have no tasks assigned'}
            </p>
          </motion.div>
        )}

      {/* Enhanced Full-Width Task Detail Modal */}
<AnimatePresence>
  {isModalVisible && selectedTask && (
    <>
      {/* Separate backdrop element */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
        style={{ 
          // Force GPU rendering
          transform: 'translateZ(0)',
          // Optimize for blur performance
          willChange: 'opacity, backdrop-filter'
        }}
      />
      
      {/* Modal content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-0"
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] relative text-gray-900 dark:text-gray-200 shadow-2xl flex flex-col overflow-hidden"
          style={{
            // Force separate compositing layer
            transform: 'translateZ(0)',
            // Prevent blur bleed
            isolation: 'isolate'
          }}
        >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition duration-200 z-10"
          aria-label="Close"
        >
          <FiX className="h-5 w-5" />
        </motion.button>

        {/* Modal Content - Full width layout */}
        <div className="flex-1 overflow-y-auto p-6 ">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{selectedTask.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${statusConfig[selectedTask.status].bg} ${statusConfig[selectedTask.status].text}`}>
                  {statusConfig[selectedTask.status].icon}
                  {statusConfig[selectedTask.status].label}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${priorityConfig[selectedTask.priority].bg} ${priorityConfig[selectedTask.priority].text}`}>
                  <span className="text-sm">{priorityConfig[selectedTask.priority].icon}</span>
                  {priorityConfig[selectedTask.priority].label}
                </span>
              </div>
            </div>
            <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium mt-8">
             Total Hours: {totalHoursForSelectedTask.toFixed(2)|| '0.0'}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Description */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center gap-3 mb-3">
                  <FiClipboard className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Description</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 pl-8">
                  {selectedTask.description || 'No description provided'}
                </p>
              </div>

              {/* Time Logs Section */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-5 border border-gray-200/50 dark:border-gray-600/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FiClock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Time Tracking</h3>
              </div>
              {/* <button 
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiDownload /> Export Logs
              </button> */}
            </div>
            
           <TaskTimeLogTable 
  task={selectedTask} 
  logs={timeLogsForSelectedTask}
  isLoading={isLoadingLogs}
/>
          </div>
        </div>


            {/* Right Column - Metadata */}
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                    <FiUser className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Assignee</h3>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedTask.assignee_name || 'You'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedTask.due_date && (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                      <FiCalendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Due Date</h3>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {new Date(selectedTask.due_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
             
              {selectedTask.completion_date && (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300">
                      <FiCheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Completed On</h3>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {new Date(selectedTask.completion_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons at bottom */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-4">
          {selectedTask.status !== 'completed' && selectedTask.status !== 'cancelled' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateTaskStatus(selectedTask.id, 'completed')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <FiCheckCircle className="h-5 w-5" /> Mark Complete
            </motion.button>
          )}
          {selectedTask.status !== 'completed' && selectedTask.status !== 'cancelled' && (
            !timeLogs[selectedTask.id]  && selectedTask.id !== activeTimer ?  (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startTimer(selectedTask.id)}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 font-medium"
              >
                <FiPlay className="h-5 w-5" /> Start Timer
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
               onClick={() => {
  if (selectedTask && timeLogs[selectedTask.id]) {
    stopTimer(timeLogs[selectedTask.id].id, selectedTask.id);
  }
}}

                className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white text-sm rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 font-medium"
              >
                <FiStopCircle className="h-5 w-5" /> Stop Timer
              </motion.button>
            )
          )}
        </div>
      </motion.div>
    </motion.div>
    </>
  )}
</AnimatePresence>
      </div>
    </div>
  );
};

export default TaskManagement;