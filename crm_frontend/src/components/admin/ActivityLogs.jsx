import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
  UserPlus,
  ArrowUpRight,
  XCircle,
  Shield,
  ChevronRight,
  Calendar,
  Clock,
  Activity,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ChevronsLeft,    // Replaces FirstPage
  ChevronsRight,   // Replaces LastPage
  Timer,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ActivityLogs = () => {
  // Activity Logs State
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState(null);
  
  // Task Time Logs State
  const [taskTimeLogs, setTaskTimeLogs] = useState([]);
  const [taskLogsLoading, setTaskLogsLoading] = useState(true);
  const [taskLogsError, setTaskLogsError] = useState(null);
  const [activeTab, setActiveTab] = useState('activity');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTaskPage, setCurrentTaskPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/activity-logs/');
      
      if (response.data && Array.isArray(response.data)) {
        setLogs(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setLogs(response.data.results);
      } else {
        console.error('Unexpected API response structure:', response.data);
        setError('Unexpected data format from server');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to load activity logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskTimeLogs = async () => {
    try {
      setTaskLogsLoading(true);
      const response = await axiosInstance.get('/employees/task-time-logs/');
      
      if (response.data && Array.isArray(response.data)) {
        setTaskTimeLogs(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setTaskTimeLogs(response.data.results);
      } else {
        console.error('Unexpected task time logs response:', response.data);
        setTaskLogsError('Unexpected data format from server');
      }
    } catch (err) {
      console.error('Task Time Logs API Error:', err);
      setTaskLogsError('Failed to load task time logs. Please try again.');
    } finally {
      setTaskLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
    fetchTaskTimeLogs();
  }, []);

  const getEventDetails = (action) => {
    const event = (action || '').toUpperCase().trim();

    const styles = {
      CREATE: { 
        description: 'created a new', 
        icon: <UserPlus className="text-green-500 dark:text-green-400" size={18} />,
        color: 'bg-green-100 dark:bg-green-900/30'
      },
      UPDATE: { 
        description: 'updated a', 
        icon: <ArrowUpRight className="text-blue-500 dark:text-blue-400" size={18} />,
        color: 'bg-blue-100 dark:bg-blue-900/30'
      },
      DELETE: { 
        description: 'deleted a', 
        icon: <XCircle className="text-red-500 dark:text-red-400" size={18} />,
        color: 'bg-red-100 dark:bg-red-900/30'
      },
      LOGIN: { 
        description: 'logged in', 
        icon: <Shield className="text-green-500 dark:text-green-400" size={18} />,
        color: 'bg-green-100 dark:bg-green-900/30'
      },
      LOGOUT: { 
        description: 'logged out', 
        icon: <Shield className="text-red-500 dark:text-red-400" size={18} />,
        color: 'bg-red-100 dark:bg-red-900/30'
      }
    };

    return styles[event] || {
      description: 'performed an action',
      icon: <Activity className="text-gray-500 dark:text-gray-400" size={18} />,
      color: 'bg-gray-100 dark:bg-gray-800'
    };
  };

  const getTaskStatus = (startTime, endTime) => {
    if (!startTime) return {
      status: 'Not Started',
      icon: <AlertCircle className="text-gray-500 dark:text-gray-400" size={18} />,
      color: 'bg-gray-100 dark:bg-gray-700'
    };
    
    if (!endTime) return {
      status: 'In Progress',
      icon: <Timer className="text-yellow-500 dark:text-yellow-400" size={18} />,
      color: 'bg-yellow-100 dark:bg-yellow-900/30'
    };
    
    return {
      status: 'Completed',
      icon: <CheckCircle className="text-green-500 dark:text-green-400" size={18} />,
      color: 'bg-green-100 dark:bg-green-900/30'
    };
  };

  const formatHoursSpent = (hours) => {
    if (!hours || hours === '-') return '--';
    const num = parseFloat(hours);
    if (isNaN(num)) return hours;
    return `${num.toFixed(2)} hours`;
  };

  // Filter and paginate activity logs
  const filteredLogs = filter === 'ALL' 
    ? logs 
    : logs.filter(log => (log.action || '').toUpperCase() === filter);

  const activityLogsPaginated = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const activityTotalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // Paginate task time logs
  const taskLogsPaginated = taskTimeLogs.slice(
    (currentTaskPage - 1) * itemsPerPage,
    currentTaskPage * itemsPerPage
  );
  const taskTotalPages = Math.ceil(taskTimeLogs.length / itemsPerPage);

  const eventTypes = [
    { value: 'ALL', label: 'All Activities', icon: <Activity size={16} /> },
    { value: 'CREATE', label: 'Creations', icon: <UserPlus size={16} /> },
    { value: 'UPDATE', label: 'Updates', icon: <ArrowUpRight size={16} /> },
    { value: 'DELETE', label: 'Deletions', icon: <XCircle size={16} /> },
    { value: 'LOGIN', label: 'Logins', icon: <Shield size={16} /> },
    { value: 'LOGOUT', label: 'Logouts', icon: <Shield size={16} /> }
  ];

  const renderPagination = (current, total, setPage, prefix = '') => {
    const goToFirstPage = () => setPage(1);
    const goToLastPage = () => setPage(total);
    const goToNextPage = () => current < total && setPage(current + 1);
    const goToPrevPage = () => current > 1 && setPage(current - 1);
    const paginate = (page) => setPage(page);

    return (
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Page {current} of {total}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToFirstPage}
            disabled={current === 1}
            className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
          >
            <ChevronsLeft size={18} /> {/* Replaced FirstPage */}
          </button>
          <button
            onClick={goToPrevPage}
            disabled={current === 1}
            className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
          >
            <ChevronLeft size={18} />
          </button>
          
          {Array.from({ length: Math.min(5, total) }, (_, i) => {
            let pageNum;
            if (total <= 5) {
              pageNum = i + 1;
            } else if (current <= 3) {
              pageNum = i + 1;
            } else if (current >= total - 2) {
              pageNum = total - 4 + i;
            } else {
              pageNum = current - 2 + i;
            }

            return (
              <button
                key={`${prefix}-${pageNum}`}
                onClick={() => paginate(pageNum)}
                className={`w-10 h-10 rounded-md ${
                  current === pageNum
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={goToNextPage}
            disabled={current === total}
            className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
          >
            <ChevronRightIcon size={18} />
          </button>
          <button
            onClick={goToLastPage}
            disabled={current === total}
            className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
          >
            <ChevronsRight size={18} /> {/* Replaced LastPage */}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-1 dark:text-white">
          {activeTab === 'activity' ? (
            <Activity className="text-indigo-600 dark:text-indigo-400" size={24} />
          ) : (
            <Timer className="text-indigo-600 dark:text-indigo-400" size={24} />
          )}
          {activeTab === 'activity' ? 'Activity Logs' : 'Task Time Logs'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {activeTab === 'activity' 
            ? 'Track all user activities and system changes' 
            : 'View time tracking for employee tasks'}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'activity'
              ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Activity size={16} />
          Activity Logs
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Timer size={16} />
          Task Time Logs
        </button>
      </div>

      {activeTab === 'activity' ? (
        <>
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-md mb-4 border-l-4 border-red-500 text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 dark:shadow-gray-800/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
              <h2 className="font-medium flex items-center gap-2 dark:text-white">
                <Filter size={18} />
                Filter Activities
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} activities
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setFilter(value);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                    filter === value 
                      ? 'bg-indigo-600 dark:bg-indigo-700 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-200'
                  } transition-colors`}
                >
                  {React.cloneElement(icon, {
                    className: filter === value ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                  })}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin h-12 w-12 text-indigo-500" />
            </div>
          ) : activityLogsPaginated.length > 0 ? (
            <div>
              <div className="space-y-3 mb-6">
                {activityLogsPaginated.map((log) => {
                  const { description, icon, color } = getEventDetails(log.action);
                  const timestamp = new Date(log.timestamp);
                  const userName = log.user || log.employee_first_name || 'System';

                  return (
                    <div 
                      key={log.id} 
                      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border hover:shadow-md transition dark:border-gray-700 dark:hover:shadow-gray-800/30"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${color}`}>
                          {icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="dark:text-gray-200">
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{userName}</span>{' '}
                              {description} {log.model_name || 'record'}{' '}
                              {log.description && (
                                <span className="text-gray-500 dark:text-gray-400">({log.description})</span>
                              )}
                            </p>
                            <ChevronRight className="text-gray-400 dark:text-gray-500" size={18} />
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{timestamp.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {log.object_id && (
                              <div className="flex items-center gap-1">
                                <span>ID: {log.object_id}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {renderPagination(currentPage, activityTotalPages, setCurrentPage, 'activity')}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center dark:shadow-gray-800/30">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Activity className="text-gray-400 dark:text-gray-500" size={24} />
              </div>
              <h3 className="text-lg font-medium mb-1 dark:text-white">No activities found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'ALL'
                  ? 'There are no activity logs available.'
                  : `No activities match the "${eventTypes.find(t => t.value === filter)?.label}" filter.`}
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {taskLogsError && (
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-md mb-4 border-l-4 border-red-500 text-red-700 dark:text-red-300">
              {taskLogsError}
            </div>
          )}

          {taskLogsLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin h-12 w-12 text-indigo-500" />
            </div>
          ) : taskLogsPaginated.length > 0 ? (
            <div>
              <div className="space-y-3 mb-6">
                {taskLogsPaginated.map((log) => {
                  const { icon, color, status } = getTaskStatus(log.start_time, log.end_time);
                  const startTime = log.start_time ? new Date(log.start_time) : null;
                  const endTime = log.end_time ? new Date(log.end_time) : null;

                  return (
                    <div 
                      key={log.id} 
                      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border hover:shadow-md transition dark:border-gray-700 dark:hover:shadow-gray-800/30"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${color}`}>
                          {icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                                {log.task_name || 'Untitled Task'}
                              </p>
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                                <span className="font-medium">{log.employee_name}</span> • {status}
                              </p>
                            </div>
                            <ChevronRight className="text-gray-400 dark:text-gray-500" size={18} />
                          </div>
                          
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>
                                {startTime 
                                  ? startTime.toLocaleDateString() 
                                  : 'Not started'}
                              </span>
                            </div>
                            
                            {startTime && (
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>
                                  {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {endTime && ` - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <span>Time spent: {formatHoursSpent(log.hours_spent)}</span>
                            </div>
                          </div>
                          
                          {log.description && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                              {log.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {renderPagination(currentTaskPage, taskTotalPages, setCurrentTaskPage, 'task')}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center dark:shadow-gray-800/30">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Timer className="text-gray-400 dark:text-gray-500" size={24} />
              </div>
              <h3 className="text-lg font-medium mb-1 dark:text-white">No task time logs found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                There are no task time logs available.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActivityLogs;