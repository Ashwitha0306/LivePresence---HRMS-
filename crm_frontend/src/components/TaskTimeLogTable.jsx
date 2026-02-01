import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import * as XLSX from 'xlsx';
import { FiDownload, FiCheck, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const TaskTimeLogTable = ({ task }) => {
  const [logs, setLogs] = useState([]);
  const [editingLog, setEditingLog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get('/employees/task-time-logs/');
        const filtered = res.data.filter((log) => log.task === task.id);
        setLogs(filtered);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
        setError('Failed to load time logs. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (task?.id) fetchLogs();
  }, [task]);

const totalHours = logs.reduce((sum, log) => {
  const hours = Number(log?.hours_spent) || 0; // Convert to number safely
  return sum + hours;
}, 0); // Always provide initial value

// Then when using:
const displayHours = Number.isFinite(totalHours) ? totalHours.toFixed(2) : "0.00";
  const formatDate = (str) => {
    if (!str) return '—';
    const date = new Date(str);
    return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString('en-IN') + ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const exportToExcel = () => {
    const metadata = [
      ['Task Name:', task.name],
      ['Task Status:', task.status],
      ['Task Start Date:', task.created_at ? formatDate(task.created_at) : 'Not Available'],
      ['Total Hours Spent:', totalHours?.toFixed(2)],
      [],
    ];

    const headers = ['Start Time', 'End Time', 'Hours Spent'];
    const rows = logs.map((log) => [
      formatDate(log.start_time),
      formatDate(log.end_time),
      (parseFloat(log.hours_spent) || 0).toFixed(2),
    ]);

    const worksheetData = [...metadata, headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Task Logs');
    
    const fileName = `TaskLog_${task.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleSave = async () => {
    try {
      // Add your save logic here
      setEditingLog(null);
    } catch (err) {
      console.error('Failed to update log:', err);
    }
  };

  return (
    <div className="mt-4">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-300">
          {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">No time logs recorded for this task yet.</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden bg-white dark:bg-slate-800"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <div className="mb-2 sm:mb-0">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Time Logs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total hours spent: <span className="font-medium text-blue-600 dark:text-blue-400">{totalHours?.toFixed(2)}</span>
              </p>
            </div>
            <motion.button 
              onClick={exportToExcel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-md text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors shadow-sm text-slate-700 dark:text-slate-200"
            >
              <FiDownload size={14} /> Export Logs
            </motion.button>
          </div>

          {/* Table */}
          <div className="max-h-60 overflow-y-auto custom-scroll">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium">Start Time</th>
                  <th className="px-4 py-3 font-medium">End Time</th>
                  <th className="px-4 py-3 font-medium">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                <AnimatePresence>
                  {logs.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ backgroundColor: 'var(--tw-bg-opacity)' }}
                      className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      {editingLog?.id === log.id ? (
                        <>
                          <td className="px-4 py-3">
                            <input
                              type="datetime-local"
                              value={editingLog.start_time}
                              onChange={(e) => setEditingLog({...editingLog, start_time: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-xs bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="datetime-local"
                              value={editingLog.end_time}
                              onChange={(e) => setEditingLog({...editingLog, end_time: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-xs bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.25"
                              value={editingLog.hours_spent}
                              onChange={(e) => setEditingLog({...editingLog, hours_spent: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-xs bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={handleSave}
                                className="p-1 text-green-600 hover:text-green-800 dark:hover:text-green-400 transition-colors"
                                title="Save"
                              >
                                <FiCheck size={14} />
                              </button>
                              <button
                                onClick={() => setEditingLog(null)}
                                className="p-1 text-red-600 hover:text-red-800 dark:hover:text-red-400 transition-colors"
                                title="Cancel"
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium text-slate-800 dark:text-slate-100">{formatDate(log.start_time)}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className={log.end_time ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-500 italic"}>
                              {log.end_time ? formatDate(log.end_time) : '—'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-blue-600 dark:text-blue-400">
                              {(parseFloat(log.hours_spent) || 0).toFixed(2)}
                            </div>
                          </td>
                        </>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TaskTimeLogTable;