import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { message, Tag, Modal } from 'antd';
import {
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  ListBulletIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarDark.css';
import { motion, AnimatePresence } from 'framer-motion';

const LeaveDashboard = () => {
  const employeeId = localStorage.getItem('employeeId') || '22bae14a-00dd-40d5-a5b6-682667c1f406';
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    half_day: false,
    half_day_type: '',
    reason: '',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [typesRes, requestRes, balanceRes, holidayRes] = await Promise.all([
        axiosInstance.get('/leave/leaveType/'),
        axiosInstance.get(`/leave/leaveRequest/?employee=${employeeId}`),
        axiosInstance.get(`/leave/leaveBalance/employee_balances/?employee_id=${employeeId}&year=${currentYear}`),
        axiosInstance.get('/leave/Holiday/'),
      ]);

      setLeaveTypes(typesRes.data);
      setLeaveRequests(requestRes.data);
      setHolidays(holidayRes.data);

      const balanceMap = {};
      balanceRes.data.forEach((b) => {
        const key = b.leave_type?.id || b.leave_type_name;
        balanceMap[key] = {
          id: b.id,
          leave_type_name: b.leave_type?.name || b.leave_type_name || 'Unnamed',
          days_allowed: b.total_days ?? 0,
          used: b.used_days ?? 0,
          remaining: Math.max(0, (b.total_days ?? 0) - (b.used_days ?? 0)),
        };
      });

      const normalizedBalances = typesRes.data.map((type) => {
        const existing = balanceMap[type.id] || balanceMap[type.name];
        if (existing) return existing;

        return {
          id: `generated-${type.id}`,
          leave_type_name: type.name,
          days_allowed: type.total_days ?? 0,
          used: 0,
          remaining: type.total_days ?? 0,
        };
      });

      setLeaveBalances(normalizedBalances);
    } catch (error) {
      setErrorMessage('Failed to load leave data. Please try again later.');
      console.error(error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [employeeId, currentYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getLeaveDates = () => {
    const approved = new Set();
    const pending = new Set();
    const rejected = new Set();

    leaveRequests.forEach(({ start_date, end_date, status }) => {
      let current = new Date(start_date);
      const end = new Date(end_date);
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        if (status === 'APPROVED') approved.add(dateStr);
        else if (status === 'PENDING') pending.add(dateStr);
        else if (status === 'REJECTED') rejected.add(dateStr);
        current.setDate(current.getDate() + 1);
      }
    });

    return { approved, pending, rejected };
  };

  const { approved, pending, rejected } = getLeaveDates();
  const today = new Date().toISOString().split('T')[0];
  const allHolidayDates = new Set(holidays.map((h) => h.date));

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateStr = date.toLocaleDateString('en-CA');
    if (approved.has(dateStr)) return 'approved-day';
    if (pending.has(dateStr)) return 'pending-day';
    if (rejected.has(dateStr)) return 'rejected-day';
    if (allHolidayDates.has(dateStr)) return 'holiday-day';
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const { start_date, end_date, leave_type, half_day } = formData;
    const start = new Date(start_date);
    const end = new Date(end_date);

    if (start > end) {
      setErrorMessage('End date must be after or equal to the start date.');
      return;
    }

    const requestedDays = half_day ? 0.5 : ((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const selectedLeaveType = leaveTypes.find((lt) => String(lt.id) === String(leave_type));
    if (!selectedLeaveType) {
      setErrorMessage('Please select a valid leave type.');
      return;
    }

    const selectedBalance = leaveBalances.find(
      (b) => b.leave_type_name === selectedLeaveType.name
    );

    if (!selectedBalance) {
      setErrorMessage(`No leave balance found for selected type: ${selectedLeaveType.name}`);
      return;
    }

    if (requestedDays > selectedBalance.remaining) {
      setErrorMessage(`You only have ${selectedBalance.remaining} day(s) remaining for ${selectedBalance.leave_type_name}.`);
      return;
    }

    const payload = {
      ...formData,
      employee: employeeId,
      status: 'PENDING',
      end_date: half_day ? start_date : end_date,
    };

    try {
      await axiosInstance.post('/leave/leaveRequest/', payload);
      message.success('Leave request submitted successfully!');
      setFormData({
        leave_type: '',
        start_date: '',
        end_date: '',
        half_day: false,
        half_day_type: '',
        reason: '',
      });
      setModalVisible(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to submit leave request. Please try again.');
    }
  };

  const formattedDays = (days) => `${parseFloat(days).toFixed(1)} day${days !== 1 ? 's' : ''}`;

  const getStatusTag = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Tag 
            icon={<CheckCircleOutlined />} 
            color="green"
            className="flex items-center gap-1"
          >
            Approved
          </Tag>
        );
      case 'PENDING':
        return (
          <Tag 
            icon={<ClockCircleOutlined />} 
            color="orange"
            className="flex items-center gap-1"
          >
            Pending
          </Tag>
        );
      case 'REJECTED':
        return (
          <Tag 
            icon={<CloseCircleOutlined />} 
            color="red"
            className="flex items-center gap-1"
          >
            Rejected
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const showDeleteConfirm = (id, e) => {
    e.stopPropagation();
    setSelectedLeaveId(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/leave/leaveRequest/${selectedLeaveId}/`);
      message.success('Leave request deleted successfully!');
      setDeleteModalVisible(false);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error(
        `Failed to delete leave request: ${err.response?.data?.detail || err.message}`
      );
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
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
          Loading your Leave Dashboard...
        </p>
      </div>
    );
  }

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

  const cardVariants = {
    hover: { 
      y: -5,
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="w-full p-4 md:p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
      {/* Error Message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <CloseCircleOutlined />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage('')}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1500px] mx-auto space-y-8 ml-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent"
          >
            <span> Leave Management </span>
          </motion.h1>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-full ${isRefreshing ? 'text-blue-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{ duration: 0.5, repeat: isRefreshing ? Infinity : 0 }}
              >
              <ArrowPathIcon className="h-5 w-5"/> 
              </motion.div>
            </motion.button>
             
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setModalVisible(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-lg shadow-md transition-all duration-200"
            >
              <PlusOutlined />
              <span>Request Leave</span>
            </motion.button>
          </div>
        </div>

        {/* Leave Balance Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {leaveBalances.map((balance) => (
            <motion.div
              key={balance.id}
              whileHover="hover"
              variants={cardVariants}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                  {balance.leave_type_name}
                </h3>
                <div className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {formattedDays(balance.remaining)} left
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total:</span>
                  <span className="font-medium">{formattedDays(balance.days_allowed)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Used:</span>
                  <span className="font-medium">{formattedDays(balance.used)}</span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(balance.used / balance.days_allowed) * 100 || 0}%` }}
                  transition={{ duration: 1, type: 'spring' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Calendar and Holidays */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Calendar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md lg:col-span-2 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-500" />
                Leave Calendar
              </h2>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <Calendar 
                tileClassName={tileClassName}
                className="w-full border-0"
              />
            </motion.div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="w-3 h-3 bg-green-500 rounded-full" /> Approved
              </span>
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="w-3 h-3 bg-yellow-500 rounded-full" /> Pending
              </span>
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="w-3 h-3 bg-red-500 rounded-full" /> Rejected
              </span>
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="w-3 h-3 bg-blue-500 rounded-full" /> Holiday
              </span>
            </div>
          </motion.div>

          {/* Holidays */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-blue-500" />
                Upcoming Holidays
              </h2>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                {holidays.filter(h => h.date >= today).length} upcoming
              </span>
            </div>
            <div className="space-y-3">
              {holidays.filter(h => h.date >= today).length > 0 ? (
                holidays
                  .filter(h => h.date >= today)
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 5)
                  .map((holiday, index) => (
                    <motion.div
                      key={holiday.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ x: 5 }}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <span className="font-medium">{holiday.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(holiday.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </motion.div>
                  ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-4 text-gray-500 dark:text-gray-400"
                >
                  No upcoming holidays
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Leave Requests */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <ListBulletIcon className="h-5 w-5 text-blue-500" />
              My Leave Requests
            </h2>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
              {leaveRequests.length} total
            </span>
          </div>

          {leaveRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <ClockCircleOutlined className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                No leave requests yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Submit a leave request to get started
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setModalVisible(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-lg shadow-sm transition-all duration-200"
              >
                Request Leave
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {leaveRequests
                .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
                .map((leave) => (
                  <motion.div
                    key={leave.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex justify-between items-start">
                      <div 
                        onClick={() => navigate(`/leave/detail/${leave.id}`)}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Tag color="blue" className="m-0">
                            {leave.leave_type_name}
                          </Tag>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {leave.number_of_days} day{leave.number_of_days !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="font-medium">
                          {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                        </div>
                        {leave.reason && (
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">
                            {leave.reason}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusTag(leave.status)}
                        {leave.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={(e) => showDeleteConfirm(leave.id, e)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          )}
        </motion.div>

        {/* Delete Confirmation Modal */}
        <Modal
          title="Confirm Delete"
          visible={deleteModalVisible}
          onOk={handleDelete}
          onCancel={() => setDeleteModalVisible(false)}
          okText="Delete"
          okButtonProps={{ className: "bg-red-500 hover:bg-red-600 border-red-500" }}
          cancelText="Cancel"
          className="[&_.ant-modal-content]:bg-white dark:[&_.ant-modal-content]:bg-gray-800 
                     [&_.ant-modal-header]:bg-white dark:[&_.ant-modal-header]:bg-gray-800
                     [&_.ant-modal-title]:text-gray-800 dark:[&_.ant-modal-title]:text-white
                     [&_.ant-modal-close]:text-gray-400 dark:[&_.ant-modal-close]:text-gray-300
                     [&_.ant-modal-body]:text-gray-700 dark:[&_.ant-modal-body]:text-gray-300"
        >
          <p className="text-gray-700 dark:text-gray-300">Are you sure you want to delete this leave request?</p>
        </Modal>

        {/* Leave Request Modal */}
        <AnimatePresence>
          {modalVisible && (
            <Modal
              title={
                <div className="flex items-center gap-2">
                  <PlusOutlined className="text-blue-500" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Request Leave</span>
                </div>
              }
              open={modalVisible}
              onCancel={() => setModalVisible(false)}
              footer={null}
              centered
              width={600}
              className="[&_.ant-modal-content]:bg-white dark:[&_.ant-modal-content]:bg-gray-800 
                         [&_.ant-modal-header]:bg-white dark:[&_.ant-modal-header]:bg-gray-800
                         [&_.ant-modal-title]:text-gray-800 dark:[&_.ant-modal-title]:text-white
                         [&_.ant-modal-close]:text-gray-400 dark:[&_.ant-modal-close]:text-gray-300
                         [&_.ant-modal-body]:text-gray-700 dark:[&_.ant-modal-body]:text-gray-300"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleLeaveSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Leave Type
                    </label>
                    <select
                      name="leave_type"
                      value={formData.leave_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select leave type</option>
                      {leaveTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={`grid ${formData.half_day ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {formData.half_day ? 'Date' : 'Start Date'}
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    
                    {!formData.half_day && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="half_day"
                      checked={formData.half_day}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                    />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Half Day
                    </label>
                    {formData.half_day && (
                      <select
                        name="half_day_type"
                        value={formData.half_day_type}
                        onChange={handleInputChange}
                        className="ml-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select half day</option>
                        <option value="FIRST">First Half</option>
                        <option value="SECOND">Second Half</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reason
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      rows={3}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Briefly explain the reason for your leave"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setModalVisible(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2"
                    >
                      Submit Request
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LeaveDashboard;