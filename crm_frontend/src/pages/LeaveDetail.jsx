import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingOutlined } from '@ant-design/icons';
import { toast, Toaster } from 'react-hot-toast';

const LeaveDetail = () => {
  const { leaveId } = useParams();
  const navigate = useNavigate();
  const employeeId = localStorage.getItem('employeeId');
  const userInitials = localStorage.getItem('userInitials') || 'U';

  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeave = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/leave/leaveRequest/${leaveId}/`);
      setLeave(res.data);
    } catch (err) {
      console.error('❌ Error fetching leave detail:', err);
      toast.error('Failed to load leave details');
    } finally {
      setLoading(false);
    }
  }, [leaveId]);

  useEffect(() => {
    if (leaveId) fetchLeave();
  }, [leaveId, fetchLeave]);

  const handleAddOrUpdateComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCommentId) {
        await axiosInstance.patch(`/leave/leaveCommen/${editingCommentId}/`, { comment: commentText });
        toast.success('Comment updated successfully!', {
          icon: '✏️',
          style: {
            background: '#10c74dff',
            color: '#fff',
          },
        });
      } else {
        await axiosInstance.post(`/leave/leaveRequest/${leaveId}/add_comment/`, {
          employee: employeeId,
          comment: commentText,
        });
        toast.success('Comment added successfully!', {
          icon: '💬',
          style: {
            background: '#10c74dff',
            color: '#fff',
          },
        });
      }
      setCommentText('');
      setEditingCommentId(null);
      fetchLeave();
    } catch (err) {
      console.error('❌ Error saving comment:', err);
      toast.error('Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    toast((t) => (
      <div className="flex flex-col">
        <p className="font-medium mb-2">Are you sure you want to delete this comment?</p>
        <div className="flex gap-2 self-end">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axiosInstance.delete(`/leave/leaveCommen/${commentId}/`);
                toast.success('Comment deleted successfully!', {
                  icon: '🗑️',
                  style: {
                    background: '#ef4444',
                    color: '#fff',
                  },
                });
                fetchLeave();
              } catch (err) {
                console.error('❌ Error deleting comment:', err);
                toast.error('Failed to delete comment');
              }
            }}
            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      style: {
        minWidth: '300px',
      },
    });
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
        <motion.p 
          className="text-lg font-medium text-gray-600 dark:text-gray-300"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Loading your Leave Detail...
        </motion.p>
      </div>
    );
  }

  if (!leave) {
    return (
      <motion.div 
        className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0f172a] p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center max-w-md">
          <motion.div 
            className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Leave Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The requested leave details could not be loaded. Please check the ID and try again.
          </p>
          <motion.button
            onClick={() => navigate('/leave')}
            className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Dashboard
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const emp = leave.employee;
  const statusColors = {
    APPROVED: { 
      bg: 'bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10', 
      text: 'text-green-800 dark:text-green-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    REJECTED: { 
      bg: 'bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/10', 
      text: 'text-red-800 dark:text-red-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    PENDING: { 
      bg: 'bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10', 
      text: 'text-amber-800 dark:text-amber-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  };

  return (
    <motion.div 
      className="min-h-screen bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white p-4 md:p-8 font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
      
      <div className="max-w-[1500px] mx-auto space-y-8 ml-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <motion.div 
            className="animate-fadeIn"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Leave Request Details
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              • Submitted on {new Date(leave.created_at).toLocaleDateString()}
            </p>
          </motion.div>
          
          <motion.button
            onClick={() => navigate('/leave')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg shadow transition-all border border-gray-200 dark:border-gray-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </motion.button>
        </div>

        {/* Leave Detail Card */}
        <motion.div 
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            y: -5
          }}
        >
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-6">
                <motion.div 
                  className="animate-slideInLeft"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="text-xs font-semibold  tracking-wider text-gray-500 dark:text-gray-400 mb-1">Employee</label>
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-teal-400 to-teal-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                      {emp.first_name.charAt(0)}{emp.last_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{emp.first_name} {emp.last_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {emp.employee_id}</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="animate-slideInLeft"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 mb-1">Leave Type</label>
                  <p className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="font-medium">{leave.leave_type?.name || leave.leave_type_name || '—'}</span>
                  </p>
                </motion.div>
                
                <motion.div 
                  className="animate-slideInLeft"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="text-xs font-semibold  tracking-wider text-gray-500 dark:text-gray-400 mb-1">Reason</label>
                  <p className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    {leave.reason || '—'}
                  </p>
                </motion.div>
              </div>
              
              <div className="space-y-6">
                <motion.div 
                  className="grid grid-cols-2 gap-4 animate-slideInRight"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                    <p className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{leave.start_date}</span>
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 mb-1">End Date</label>
                    <p className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{leave.end_date}</span>
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 mb-1">Total Days</label>
                    <p className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{leave.number_of_days} days</span>
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 mb-1">Half Day</label>
                    <p className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                      {leave.half_day ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-medium">Yes ({leave.half_day_type})</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="font-medium">No</span>
                        </>
                      )}
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="animate-slideInRight"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 mb-1">Status</label>
                  <motion.div 
                    className={`inline-flex items-center px-4 py-2 rounded-lg ${statusColors[leave.status].bg} ${statusColors[leave.status].text} font-medium shadow-sm`}
                    animate={{ 
                      scale: [1, 1.03, 1],
                      boxShadow: ['0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
                      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)']
                    }}
                    transition={{ duration: 0.5, repeat: 1, repeatType: 'reverse' }}
                  >
                    {statusColors[leave.status].icon}
                    <span className={`w-2 h-2 rounded-full mr-2 ${leave.status === 'APPROVED' ? 'bg-green-500' : leave.status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                    {leave.status}
                  </motion.div>
                  
                  {leave.status === 'APPROVED' && (
                    <motion.div 
                      className="mt-4 space-y-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ delay: 0.4 }}
                    >
                      <p className="text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Approved by: <span className="font-medium">{leave.approved_by_name || '—'}</span></span>
                      </p>
                      <p className="text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Approved at: <span className="font-medium">{leave.approved_at || '—'}</span></span>
                      </p>
                    </motion.div>
                  )}
                  
                  {leave.status === 'REJECTED' && leave.rejection_reason && (
                    <motion.div 
                      className="mt-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 mb-1">Rejection Reason</label>
                      <p className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-800">
                        {leave.rejection_reason}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div 
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            y: -5
          }}
        >
          <div className="p-6">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600 dark:from-teal-400 dark:to-teal-300 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Comments
            </h3>
            
            {leave.comments?.length === 0 ? (
              <motion.div 
                className="text-center py-8 animate-fadeIn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to add one!</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {leave.comments.map((comment) => (
                    <motion.div 
                      key={comment.id} 
                      className={`p-4 rounded-lg ${
                        String(comment.employee) === String(employeeId) 
                          ? 'bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/10 border border-teal-100 dark:border-teal-800 ml-8' 
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-700/10 border border-gray-200 dark:border-gray-600'
                      }`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      layout
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-sm ${
                            String(comment.employee) === String(employeeId)
                              ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white'
                              : 'bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 text-white'
                          }`}>
                            {comment.employee?.first_name?.charAt(0)}{comment.employee?.last_name?.charAt(0)}
                          </div>
                          <div>
                            <p className={`font-medium ${
                              String(comment.employee) === String(employeeId) 
                                ? 'text-teal-700 dark:text-teal-200' 
                                : 'text-gray-800 dark:text-white'
                            }`}>
                              {comment.employee?.first_name} {comment.employee?.last_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(comment.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {String(comment.employee) === String(employeeId) && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setCommentText(comment.comment);
                              }}
                              className="text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                              title="Edit comment"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Delete comment"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pl-11">
                        <p>{comment.comment}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <motion.form 
              onSubmit={handleAddOrUpdateComment} 
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {editingCommentId ? 'Edit Comment' : 'Add a Comment'}
              </label>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                    {userInitials}
                  </div>
                </div>
                <div className="flex-grow">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    placeholder="Write your comment here..."
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none transition-all duration-300 focus:shadow-sm"
                    required
                    disabled={isSubmitting}
                  />
                  <div className="flex flex-wrap gap-3 mt-3">
                    <motion.button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg shadow transition-all flex items-center gap-2 disabled:opacity-70"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <LoadingOutlined className="text-white" />
                        </motion.div>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingCommentId ? "M5 13l4 4L19 7" : "M12 19l9 2-9-18-9 18 9-2zm0 0v-8"} />
                        </svg>
                      )}
                      {editingCommentId ? 'Update Comment' : 'Post Comment'}
                    </motion.button>
                    {editingCommentId && (
                      <motion.button
                        type="button"
                        onClick={() => {
                          setEditingCommentId(null);
                          setCommentText('');
                        }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.form>
          </div>
        </motion.div>
      </div>
      
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.4s ease-out forwards;
        }
        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out forwards;
        }
        .animate-commentIn {
          animation: commentIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes commentIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
};

export default LeaveDetail;