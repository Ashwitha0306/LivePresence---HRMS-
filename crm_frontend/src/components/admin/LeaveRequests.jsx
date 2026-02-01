import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import LeavePolicy from './LeavePolicy';
import { 
  BadgeCheck, 
  XCircle, 
  Calendar as CalendarIcon,
  ChevronDown,
  Search,
  Filter,
  Check,
  X,
  UserCheck,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronUp,
  MessageSquare,
  Plus,
  Loader2,
  Sun,
  Moon,
  Trash2,
  Edit
} from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../index.css';
import { format, isToday, differenceInDays, addDays } from 'date-fns';

// Modal Component
const Modal = ({ isOpen, onClose, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto relative animate-fade-in`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusColors = {
    PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
    APPROVED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
    REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
  };

  const statusIcons = {
    PENDING: <Clock size={16} className="text-yellow-500" />,
    APPROVED: <BadgeCheck size={16} className="text-green-500" />,
    REJECTED: <XCircle size={16} className="text-red-500" />
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
      {statusIcons[status]}
      {status}
    </div>
  );
};

// Half Day Badge Component - Enhanced with better styling
const HalfDayBadge = ({ halfDay, halfDayType }) => {
  if (!halfDay) return null;

  const badgeColors = halfDayType === 'FIRST' 
    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
    : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200';

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badgeColors}`}>
      {halfDayType === 'FIRST' ? (
        <>
          <Sun size={14} className="text-amber-600 dark:text-amber-400" /> First Half
        </>
      ) : (
        <>
          <Moon size={14} className="text-indigo-600 dark:text-indigo-400" /> Second Half
        </>
      )}
    </div>
  );
};

// Approve/Reject Modal Component
const ApproveRejectModal = ({ 
  isOpen, 
  onClose, 
  onApprove, 
  onReject,
  isLoading,
  approvers
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedApprover, setSelectedApprover] = useState('');

  const handleRejectWithReason = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    onReject(rejectionReason);
  };

  const handleApproveWithApprover = () => {
    if (!selectedApprover) {
      alert('Please select an approver');
      return;
    }
    onApprove(selectedApprover);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <UserCheck className="text-indigo-600 dark:text-indigo-400" size={20} />
            Approve/Reject Leave
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Approver *
            </label>
            <select
              value={selectedApprover}
              onChange={(e) => setSelectedApprover(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select an approver</option>
              {approvers.map(approver => (
                <option key={approver.employee_id} value={approver.employee_id}>
                  {approver.first_name} {approver.last_name} ({approver.designation_title})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              You must select an approver to approve this leave request
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rejection Reason (required if rejecting)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleApproveWithApprover}
              disabled={isLoading || !selectedApprover}
              className={`flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isLoading || !selectedApprover ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <Check size={18} /> Approve
                </>
              )}
            </button>
            
            <button
              onClick={handleRejectWithReason}
              disabled={isLoading || !rejectionReason.trim()}
              className={`flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isLoading || !rejectionReason.trim() ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <X size={18} /> Reject
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Holiday Form Modal Component
const HolidayFormModal = ({ 
  isOpen, 
  onClose, 
  holiday,
  onSave,
  isSaving
}) => {
  const [formData, setFormData] = useState({
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    is_recurring: false
  });

  useEffect(() => {
    if (holiday) {
      setFormData({
        name: holiday.name,
        date: holiday.date,
        description: holiday.description || '',
        is_recurring: holiday.is_recurring || false
      });
    } else {
      setFormData({
        name: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        is_recurring: false
      });
    }
  }, [holiday]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-indigo-600 dark:text-indigo-400" size={20} />
            {holiday ? 'Edit Holiday' : 'Add New Holiday'}
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Holiday Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_recurring"
                checked={formData.is_recurring}
                onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_recurring" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Recurring every year
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !formData.name || !formData.date}
              className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isSaving || !formData.name || !formData.date ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <Check size={18} /> Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// Main LeaveRequests Component
const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [comments, setComments] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [modalData, setModalData] = useState({ holiday: null, leaves: [] });
  const [showApproverModal, setShowApproverModal] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detailedLeaves, setDetailedLeaves] = useState({});
  const [activeTab, setActiveTab] = useState('requests');
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState(null);
  const [isSavingHoliday, setIsSavingHoliday] = useState(false);
  const [approvers, setApprovers] = useState([]);
  const [balanceSearch, setBalanceSearch] = useState('');
  const [leavePolicies, setLeavePolicies] = useState([]);
const filteredBalances = leaveBalances.filter(bal => {
  const searchTerm = balanceSearch.toLowerCase().trim();
  return bal.employee_name?.toLowerCase().includes(searchTerm);
});


  // Status counts for filter badges
  const statusCounts = {
    PENDING: leaveRequests.filter(l => l.status === 'PENDING').length,
    APPROVED: leaveRequests.filter(l => l.status === 'APPROVED').length,
    REJECTED: leaveRequests.filter(l => l.status === 'REJECTED').length
  };

  // Fetch all initial data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [leaveRes, holidayRes, balancesRes, approversRes] = await Promise.all([
          axiosInstance.get('leave/leaveRequest/?expand=comments,employee,approved_by_employee'),
          axiosInstance.get('leave/Holiday/'),
          axiosInstance.get('leave/leaveBalance/'),
          axiosInstance.get('employees/employees/?is_reporting_manager')
        ]);
        
      setLeaveRequests([]);

const leaveList = leaveRes.data;

// Fetch half_day_type for each leave request
const detailedLeaves = await Promise.all(
  leaveList.map(async (req) => {
    try {
      const detailRes = await axiosInstance.get(`/leave/leaveRequest/${req.id}/`);
      return { ...req, ...detailRes.data };
    } catch (err) {
      console.error(`Error fetching details for leave ${req.id}`, err);
      return req; // fallback to original data
    }
  })
);

setLeaveRequests(detailedLeaves);


        setHolidays(holidayRes.data);
        setLeaveBalances(balancesRes.data);
        setApprovers(approversRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Filter leave requests based on search and status
  const filterData = useCallback(() => {
  let filtered = [...leaveRequests];

  // Filter by status
  if (statusFilter !== 'ALL') {
    filtered = filtered.filter(req => req.status === statusFilter);
  }

  // Filter by search term
  const searchTerm = search.toLowerCase().trim();
  if (searchTerm) {
    filtered = filtered.filter(req => {
      const firstName = req.employee?.first_name || '';
      const lastName = req.employee?.last_name || '';
      const fullName = `${firstName} ${lastName}`.toLowerCase().trim();
      return fullName.includes(searchTerm);
    });
  }

  setFilteredRequests(filtered);
}, [leaveRequests, search, statusFilter]);


  useEffect(() => {
    filterData();
  }, [filterData]);

  // Handle status change (approve/reject)
  const handleStatusChange = async (id, newStatus, rejectionReason = '', approverId = null) => {
    setIsProcessing(true);
    try {
      const payload = {
        status: newStatus,
        ...(newStatus === 'REJECTED' && { rejection_reason: rejectionReason }),
        ...(newStatus === 'APPROVED' && approverId && { approved_by: approverId })
      };

      await axiosInstance.patch(`leave/leaveRequest/${id}/`, payload);
      await fetchLeaveDetails(id); // Refresh the details
      filterData(); // Refresh the filtered list
    } catch (error) {
      console.error('Error updating leave status:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fetch detailed leave information
  const fetchLeaveDetails = async (leaveId) => {
    try {
      const res = await axiosInstance.get(`/leave/leaveRequest/${leaveId}/?expand=comments,approved_by_employee`);
      setDetailedLeaves(prev => ({
        ...prev,
        [leaveId]: res.data
      }));
    } catch (err) {
      console.error('Error fetching leave details:', err);
    }
  };

  // Handle date click on calendar
  const handleDateClick = (date) => {
    const dStr = format(date, 'yyyy-MM-dd');
    const holiday = holidays.find(h => h.date === dStr);
    const leaves = leaveRequests.filter(l => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const start = new Date(l.start_date);
      const end = new Date(l.end_date);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return d >= start && d <= end;
    });

    setSelectedDate(date);
    setModalData({ holiday, leaves });
    setShowDateModal(true);
  };

  // Toggle expanded view of leave request
  const toggleExpandRequest = async (id) => {
    if (expandedRequest === id) {
      setExpandedRequest(null);
    } else {
      setExpandedRequest(id);
      if (!detailedLeaves[id]) {
        await fetchLeaveDetails(id);
      }
    }
  };

  // Calculate duration of leave with half-day consideration
const calculateDuration = (startDate, endDate, halfDay = false, halfDayType = null) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // If same day
  if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
    return halfDay ? '0.5 day' : '1 day';
  }
  
  // Calculate full days difference
  const days = differenceInDays(addDays(end, 1), start);
  
  // If it's a half day
  if (halfDay) {
    // For multi-day leaves with half day, we subtract 0.5 from the total
    const total = days - 0.5;
    return `${total} day${total !== 1 ? 's' : ''}`;
  }
  
  return `${days} day${days !== 1 ? 's' : ''}`;
};

const formatDateRange = (startDate, endDate, halfDay, halfDayType) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startStr = format(start, 'MMM d, yyyy');
  const endStr = format(end, 'MMM d, yyyy');
  
  if (startStr === endStr) {
    // Single day leave
    return halfDay 
      ? `${startStr} (${halfDayType === 'FIRST' ? 'First Half' : 'Second Half'})`
      : startStr;
  }
  
  // Multi-day leave
  const formattedStart = format(start, 'MMM d');
  const formattedEnd = format(end, 'MMM d, yyyy');
  
  if (halfDay) {
    if (halfDayType === 'FIRST') {
      return `${formattedStart} (First Half) - ${formattedEnd}`;
    } else if (halfDayType === 'SECOND') {
      return `${formattedStart} - ${formattedEnd} (Second Half)`;
    }
  }
  
  return `${formattedStart} - ${formattedEnd}`;
};


  // Add comment to leave request
  const handleAddComment = async (leaveId) => {
    const text = comments[leaveId]?.trim();
    if (!text) return;

    try {
      await axiosInstance.post(`leave/leaveRequest/${leaveId}/add_comment/`, {
        comment: text
      });
      setComments(prev => ({ ...prev, [leaveId]: '' }));
      await fetchLeaveDetails(leaveId); // Refresh comments
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  // Open approve/reject modal
  const openApproverModal = (requestId) => {
    setCurrentRequestId(requestId);
    setShowApproverModal(true);
  };

  // Handle approve action
  const handleApprove = (approverId) => {
    handleStatusChange(currentRequestId, 'APPROVED', '', approverId);
    setShowApproverModal(false);
  };

  // Handle reject action
  const handleReject = (reason) => {
    handleStatusChange(currentRequestId, 'REJECTED', reason);
    setShowApproverModal(false);
  };

  // Enhanced getDayClass function with half-day styling
  const getDayClass = (date) => {
    const dStr = format(date, 'yyyy-MM-dd');
    const isHoliday = holidays.some(h => h.date === dStr);
    const leavesOnDate = leaveRequests.filter(leave => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return d >= start && d <= end;
    });

    let classes = 'relative h-16 transition-colors rounded-md';
    classes += ' hover:bg-indigo-50 dark:hover:bg-indigo-900/10';
    
    if (isToday(date)) {
      classes += ' bg-blue-50 dark:bg-blue-900/20 font-bold';
    }
    
    if (isHoliday) {
      classes += ' bg-red-50 dark:bg-red-900/20';
    } else if (leavesOnDate.length > 0) {
      // Check if this is a half day
      const isHalfDay = leavesOnDate.some(leave => {
        const isStartDate = format(new Date(leave.start_date), 'yyyy-MM-dd') === dStr;
        const isEndDate = format(new Date(leave.end_date), 'yyyy-MM-dd') === dStr;
        
        if (leave.half_day) {
          if (isStartDate && leave.half_day_type === 'FIRST') {
            return true;
          }
          if (isEndDate && leave.half_day_type === 'SECOND') {
            return true;
          }
        }
        return false;
      });

      if (isHalfDay) {
        classes += ' bg-gradient-to-br from-purple-50 to-amber-50 dark:from-purple-900/20 dark:to-amber-900/20';
      } else {
        classes += ' bg-purple-50 dark:bg-purple-900/20';
      }
    }
    
    return classes;
  };

  // Enhanced tile content with half-day indicators
  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const dStr = format(date, 'yyyy-MM-dd');
      const isHoliday = holidays.some(h => h.date === dStr);
      const leavesOnDate = leaveRequests.filter(leave => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const start = new Date(leave.start_date);
        const end = new Date(leave.end_date);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return d >= start && d <= end;
      });

      // Check for half-day leaves
      const halfDayLeaves = leavesOnDate.filter(leave => {
        const isStartDate = format(new Date(leave.start_date), 'yyyy-MM-dd') === dStr;
        const isEndDate = format(new Date(leave.end_date), 'yyyy-MM-dd') === dStr;
        
        if (leave.half_day) {
          if (isStartDate && leave.half_day_type === 'FIRST') {
            return true;
          }
          if (isEndDate && leave.half_day_type === 'SECOND') {
            return true;
          }
        }
        return false;
      });

      return (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-end pb-1">
          {isHoliday && <div className="w-2 h-2 bg-red-500 rounded-full mb-1" />}
          {leavesOnDate.length > 0 && !isHoliday && (
            <>
              {halfDayLeaves.length > 0 ? (
                <div className="flex gap-0.5 mb-1">
                  <div className="w-1 h-2 bg-amber-500 rounded-full"></div>
                  <div className="w-1 h-2 bg-indigo-500 rounded-full"></div>
                </div>
              ) : (
                <div className="w-2 h-2 bg-purple-500 rounded-full mb-1" />
              )}
            </>
          )}
        </div>
      );
    }
  };

  // Handle save holiday
  const handleSaveHoliday = async (holidayData) => {
    setIsSavingHoliday(true);
    try {
      if (currentHoliday) {
        // Update existing holiday
        await axiosInstance.put(`leave/Holiday/${currentHoliday.id}/, holidayData`);
        setHolidays(holidays.map(h => h.id === currentHoliday.id ? {...h, ...holidayData} : h));
      } else {
        // Create new holiday
        const response = await axiosInstance.post('leave/Holiday/', holidayData);
        setHolidays([...holidays, response.data]);
      }
      setShowHolidayForm(false);
      setCurrentHoliday(null);
    } catch (error) {
      console.error('Error saving holiday:', error);
    } finally {
      setIsSavingHoliday(false);
    }
  };

  // Handle delete holiday
  const handleDeleteHoliday = async (id) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        await axiosInstance.delete(`leave/Holiday/${id}/`);
        setHolidays(holidays.filter(h => h.id !== id));
      } catch (error) {
        console.error('Error deleting holiday:', error);
      }
    }
  };

  // Open holiday form for editing
  const handleEditHoliday = (holiday) => {
    setCurrentHoliday(holiday);
    setShowHolidayForm(true);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Leave Management Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and manage employee leave requests</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-xs border border-gray-200 dark:border-gray-700 text-sm dark:text-gray-300 transition-all duration-300 hover:shadow-sm">
            <span className="font-medium">Total Requests:</span>
            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full text-xs">
              {leaveRequests.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('requests')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Leave Requests
          </button>
          <button
            onClick={() => setActiveTab('balances')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'balances'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Leave Balances
          </button>
          <button
            onClick={() => setActiveTab('holidays')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'holidays'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Holidays
          </button>
           <button
            onClick={() => setActiveTab('policy')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'policy'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Leave Policy
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="text-red-500 dark:text-red-400 mt-0.5" size={20} />
          <div>
            <h3 className="font-medium text-red-800 dark:text-red-200">Error loading data</h3>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-800 dark:text-red-200 px-3 py-1 rounded-md transition-colors flex items-center gap-1"
            >
              <Loader2 size={14} className="animate-spin" /> Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'requests' && (
            <>
              {/* Enhanced Leave Calendar Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Leave Calendar</h2>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">Holiday</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">Full Day Leave</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5">
                        <div className="w-1 h-2 bg-amber-500 rounded-full"></div>
                        <div className="w-1 h-2 bg-indigo-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">Half Day</span>
                    </div>
                  </div>
                </div>
                <Calendar
                  className="react-calendar w-full border-0"
                  onClickDay={handleDateClick}
                  tileContent={getTileContent}
                  tileClassName={({ date, view }) => view === 'month' ? getDayClass(date) : null}
                  formatShortWeekday={(locale, date) => 
                    ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]
                  }
                />
              </div>

              {/* Enhanced Leave Requests Section */}
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="relative flex-1 min-w-[250px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="text-gray-400" size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by employee name..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="pl-10 w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                      aria-label="Search leave requests"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                      <Filter size={16} />
                      <span>Filter by:</span>
                    </div>
                    <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                      {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-3 py-1 text-sm rounded-md transition-all duration-200 flex items-center gap-1 ${
                            statusFilter === status 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          aria-label={`Filter by ${status}`}
                        >
                          {status}
                          {status !== 'ALL' && (
                            <span className="bg-white/20 dark:bg-black/20 px-1.5 py-0.5 rounded-full text-xs">
                              {statusCounts[status]}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredRequests.length === 0 ? (
                    <div className="text-center py-10 animate-fade-in">
                      <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                        <CalendarIcon className="text-gray-400" size={24} />
                      </div>
                      <h4 className="text-gray-600 dark:text-gray-300 font-medium">No leave requests found</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    filteredRequests.map(request => (
                      <div 
                        key={request.id} 
                        id={`request-${request.id}`}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 animate-fade-in"
                      >
                        <div 
                          className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                          onClick={() => toggleExpandRequest(request.id)}
                          aria-expanded={expandedRequest === request.id}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <span className="text-indigo-600 dark:text-indigo-300 font-medium">
                                  {request.employee_name?.charAt(0) || 'U'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800 dark:text-white">{request.employee_name}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>
                                  {formatDateRange(
                                    request.start_date, 
                                    request.end_date, 
                                    request.half_day, 
                                    request.half_day_type
                                  )}
                                </span>
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                  {calculateDuration(
                                    request.start_date, 
                                    request.end_date, 
                                    request.half_day, 
                                    request.half_day_type
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <StatusBadge status={request.status} />
                            {expandedRequest === request.id ? (
                              <ChevronUp size={18} className="text-gray-400" />
                            ) : (
                              <ChevronDown size={18} className="text-gray-400" />
                            )}
                          </div>
                        </div>

                        {expandedRequest === request.id && (
                          <div className="p-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Leave Type</h4>
                                <p className="text-gray-800 dark:text-white flex items-center gap-2">
                                  <span className="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full text-xs">
                                    {request.leave_type_name}
                                  </span>
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h4>
                                <StatusBadge status={request.status} />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Duration</h4>
                                <div className="flex items-center gap-2">
                                  <p className="text-gray-800 dark:text-white">
                                    {calculateDuration(
                                      request.start_date,
                                      request.end_date,
                                      request.half_day,
                                      request.half_day_type
                                    )}
                                  </p>
                                  {request.half_day && request.half_day_type && (
  <HalfDayBadge 
    halfDay={request.half_day} 
    halfDayType={request.half_day_type} 
  />
)}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reason</h4>
                                <p className="text-gray-800 dark:text-white">{detailedLeaves[request.id]?.reason || 'Not specified'}</p>
                              </div>
                              {request.status === 'APPROVED' && detailedLeaves[request.id]?.approved_by_employee && (
                                <div className="md:col-span-2">
                                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                    <BadgeCheck size={16} className="text-green-500" />
                                    Approved By
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                      <span className="text-green-600 dark:text-green-300 text-sm font-medium">
                                        {detailedLeaves[request.id].approved_by_employee.first_name?.charAt(0) || 'A'}
                                      </span>
                                    </div>
                                    <p className="text-gray-800 dark:text-white">
                                      {detailedLeaves[request.id].approved_by_employee.first_name} {detailedLeaves[request.id].approved_by_employee.last_name}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {request.status === 'REJECTED' && request.rejection_reason && (
                                <div className="md:col-span-2">
                                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                    <XCircle size={16} className="text-red-500" />
                                    Rejection Reason
                                  </h4>
                                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg p-3">
                                    <p className="text-red-700 dark:text-red-300">{request.rejection_reason}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {request.status === 'PENDING' && (
                              <div className="flex justify-end gap-2 mt-4">
                                <button
                                  onClick={() => openApproverModal(request.id)}
                                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <UserCheck size={16} /> Take Action
                                </button>
                              </div>
                            )}

                            <div className="mt-6">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                  <MessageSquare size={16} /> Comments ({detailedLeaves[request.id]?.comments?.length || 0})
                                </h4>
                              </div>
                              {detailedLeaves[request.id]?.comments?.length > 0 ? (
                                <div className="space-y-3 mb-4">
                                  {detailedLeaves[request.id].comments.map((comment) => (
                                    <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                      <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-2">
                                          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mt-0.5 flex-shrink-0">
                                            <span className="text-indigo-600 dark:text-indigo-300 text-xs font-medium">
                                              {comment.employee_name?.charAt(0) || 'U'}
                                            </span>
                                          </div>
                                          <div>
                                            <p className="text-gray-800 dark:text-gray-200">{comment.comment}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              {comment.employee_name} • {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 text-center mb-4">
                                  <p className="text-gray-500 dark:text-gray-400 text-sm">No comments yet</p>
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={comments[request.id] || ''}
                                  onChange={(e) => setComments({ ...comments, [request.id]: e.target.value })}
                                  placeholder="Add a comment..."
                                  className="flex-1 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment(request.id)}
                                />
                                <button
                                  onClick={() => handleAddComment(request.id)}
                                  disabled={!comments[request.id]?.trim()}
                                  className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                                    !comments[request.id]?.trim() ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  <Plus size={16} /> Post
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === 'balances' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Leave Balances</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="text-gray-400" size={18} />
                    </div>
                    <input
  type="text"
  placeholder="Search by employee..."
  value={balanceSearch}
  onChange={(e) => setBalanceSearch(e.target.value)}
  className="pl-10 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
/>

                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Employee
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Leave Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total Days
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Used Days
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Pending Days
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Available Days
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Carried Forward
                      </th>
                    </tr>
                  </thead>
<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
  {filteredBalances.length > 0 ? (
    filteredBalances.map((balance) => (  // Changed from leaveBalances to filteredBalances
      <tr key={balance.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {balance.employee_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {balance.leave_type_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {balance.total_days}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {balance.used_days}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {balance.pending_days}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              parseFloat(balance.available_days) < 5 
                                ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                                : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                            }`}>
                              {balance.available_days}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {balance.carried_forward_days || '0'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          No leave balance records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'holidays' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Holidays</h2>
                <button
                  onClick={() => {
                    setCurrentHoliday(null);
                    setShowHolidayForm(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus size={16}/> Add Holiday
                </button>
              </div>

              <div className="space-y-4">
                {holidays.length > 0 ? (
                  holidays.map((holiday) => (
                    <div key={holiday.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">{holiday.name}</h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            {format(new Date(holiday.date), 'MMMM d, yyyy')}
                            {holiday.is_recurring && (
                              <span className="ml-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs">
                                Recurring
                              </span>
                            )}
                          </p>
                          {holiday.description && (
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{holiday.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditHoliday(holiday)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            aria-label="Edit holiday"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteHoliday(holiday.id)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            aria-label="Delete holiday"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                      <CalendarIcon className="text-gray-400" size={24} />
                    </div>
                    <h4 className="text-gray-600 dark:text-gray-300 font-medium">No holidays added yet</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Click "Add Holiday" to create your first holiday</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Date Detail Modal */}
          <Modal isOpen={showDateModal} onClose={() => setShowDateModal(false)} size="lg">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <CalendarIcon className="text-indigo-600 dark:text-indigo-400" size={20} />
                {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              
              {modalData.holiday ? (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                      <CalendarIcon className="text-red-600 dark:text-red-400" size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-red-700 dark:text-red-300">Company Holiday</h3>
                      <p className="text-red-600 dark:text-red-400">{modalData.holiday.name}</p>
                      {modalData.holiday.description && (
                        <p className="text-red-500 dark:text-red-300 text-sm mt-1">{modalData.holiday.description}</p>
                      )}
                      {modalData.holiday.is_recurring && (
                        <p className="text-red-500 dark:text-red-300 text-xs mt-1">(Recurring every year)</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-gray-500 dark:text-gray-400">No holiday on this date</p>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <UserCheck className="text-indigo-600 dark:text-indigo-400" size={18} />
                  Leave Requests
                  <span className="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full text-xs">
                    {modalData.leaves.length}
                  </span>
                </h3>
                
                {modalData.leaves.length > 0 ? (
                  <div className="space-y-3">
                    {modalData.leaves.map(leave => (
                      <div key={leave.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <span className="text-indigo-600 dark:text-indigo-300 font-medium">
                                  {leave.employee_name?.charAt(0) || 'U'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white">{leave.employee_name}</p>
                              <p className="text-gray-800 dark:text-white">
                                {leave.reason || 'Not specified'}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded">
                                  {leave.leave_type_name}
                                </span>
                                <StatusBadge status={leave.status} />
                                {leave.half_day && (
                                  <HalfDayBadge 
                                    halfDay={leave.half_day} 
                                    halfDayType={leave.half_day_type} 
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setShowDateModal(false);
                              setExpandedRequest(leave.id);
                              setTimeout(() => {
                                document.getElementById(`request-${leave.id}`)?.scrollIntoView({
                                  behavior: 'smooth',
                                  block: 'center'
                                });
                              }, 100);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm flex items-center gap-1 transition-colors duration-200"
                          >
                            View <ChevronRight size={16} />
                          </button>
                        </div>

                        {leave.status === 'REJECTED' && leave.rejection_reason && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
                              <XCircle size={14} className="text-red-600 dark:text-red-400" />
                              <span>Rejection Reason:</span>
                            </div>
                            <div className="text-xs bg-gray-100 dark:bg-gray-600 p-2 rounded mt-1">
                              {leave.rejection_reason}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No leave requests for this date</p>
                  </div>
                )}
              </div>
            </div>
          </Modal>

           {activeTab === 'policy' && (
            // <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md">

              <LeavePolicy/>


            // </div>
          )}

          

          {/* Approve/Reject Modal */}
          <ApproveRejectModal
            isOpen={showApproverModal}
            onClose={() => setShowApproverModal(false)}
            onApprove={handleApprove}
            onReject={handleReject}
            isLoading={isProcessing}
            approvers={approvers}
          />

          {/* Holiday Form Modal */}
          <HolidayFormModal
            isOpen={showHolidayForm}
            onClose={() => {
              setShowHolidayForm(false);
              setCurrentHoliday(null);
            }}
            holiday={currentHoliday}
            onSave={handleSaveHoliday}
            isSaving={isSavingHoliday}
          />
        </>
      )}
    </div>
  );
};

export default LeaveRequests;