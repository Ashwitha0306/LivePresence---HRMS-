import React, { useEffect, useState, useCallback } from 'react';
import axios from '../../api/axiosInstance';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { 
  FiClock, 
  FiUserCheck, 
  FiUserX, 
  FiCalendar, 
  FiPieChart, 
  FiBarChart2,
  FiRefreshCw,
  FiFilter,
  FiSearch,
  FiDownload,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';
import { 
  BsCheckCircleFill, 
  BsClockHistory, 
  BsXCircleFill,
  BsThreeDotsVertical
} from 'react-icons/bs';
import { IoMdTime } from 'react-icons/io';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#64748B'];

const AttendancePanel = () => {
  // State management
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [deptMap, setDeptMap] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    half_day: 0,
    total: 0,
    averageHours: '0.0',
    trend: 'stable'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportEmployeeId, setExportEmployeeId] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)),
    end: new Date()
  });
  const [viewMode, setViewMode] = useState('overview');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeStats, setEmployeeStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dailyStats, setDailyStats] = useState([]);
  const [comparisonStats, setComparisonStats] = useState({
    presentChange: 0,
    absentChange: 0,
    half_dayChange: 0
  });
  const recordsPerPage = 10;

const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    setError('');
    
    const formattedStartDate = dateRange.start.toISOString().split('T')[0];
    const formattedEndDate = dateRange.end.toISOString().split('T')[0];
    
    const prevStartDate = new Date(dateRange.start);
    const prevEndDate = new Date(dateRange.start);
    const daysDifference = Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24));
    prevStartDate.setDate(prevStartDate.getDate() - daysDifference - 1);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    
    const [attRes, empRes, prevAttRes] = await Promise.all([
      axios.get(`employees/attendance/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`),
      axios.get('employees/employees/'),
      axios.get(`employees/attendance/?start_date=${prevStartDate.toISOString().split('T')[0]}&end_date=${prevEndDate.toISOString().split('T')[0]}`)
    ]);
      const filteredRecords = attRes.data.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= dateRange.start && recordDate <= dateRange.end;
      });

      setAttendanceRecords(filteredRecords);
      setAllEmployees(empRes.data);

      const empMap = {};
      empRes.data.forEach(emp => {
        empMap[emp.employee_id] = emp.department_name || 'Unknown';
      });
      setDeptMap(empMap);

      calculateStats(filteredRecords, prevAttRes.data);
      calculateDailyStats(filteredRecords);
      
    } catch (err) {
      console.error('Error fetching data:', err?.response?.data || err.message);
      setError('Failed to fetch attendance or employee data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateStats = (currentRecords, previousRecords = []) => {
    const presentCount = currentRecords.filter(r => r.status === 'PRESENT').length;
    const absentCount = currentRecords.filter(r => r.status === 'ABSENT').length;
    const half_dayCount = currentRecords.filter(r => r.status === 'HALF_DAY').length;
    
    const presentEmployees = currentRecords.filter(r => r.status === 'PRESENT' && r.total_hours);
    const totalHours = presentEmployees.reduce((sum, emp) => sum + parseFloat(emp.total_hours || 0), 0);
    const avgHours = presentEmployees.length > 0 ? (totalHours / presentEmployees.length).toFixed(1) : '0.0';
    
    const prevPresentCount = previousRecords.filter(r => r.status === 'PRESENT').length;
    const prevAbsentCount = previousRecords.filter(r => r.status === 'ABSENT').length;
    const prevhalf_dayCount = previousRecords.filter(r => r.status === 'HALF_DAY').length;
    
    const presentChange = prevPresentCount > 0 ? 
      ((presentCount - prevPresentCount) / prevPresentCount * 100).toFixed(1) : 
      presentCount > 0 ? 100 : 0;
    const absentChange = prevAbsentCount > 0 ? 
      ((absentCount - prevAbsentCount) / prevAbsentCount * 100).toFixed(1) : 
      absentCount > 0 ? 100 : 0;
    const half_dayChange = prevhalf_dayCount > 0 ? 
      ((half_dayCount - prevhalf_dayCount) / prevhalf_dayCount * 100).toFixed(1) : 
      half_dayCount > 0 ? 100 : 0;
    
    setComparisonStats({
      presentChange,
      absentChange,
      half_dayChange
    });
    
    let trend = 'stable';
    if (presentCount > prevPresentCount) trend = 'up';
    else if (presentCount < prevPresentCount) trend = 'down';
    
    setStats({
      present: presentCount,
      absent: absentCount,
      half_day: half_dayCount,
      total: currentRecords.length,
      averageHours: avgHours,
      trend
    });
  };

  const calculateDailyStats = (records) => {
    const dailyMap = {};
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyMap[dateStr] = {
        present: 0,
        absent: 0,
        half_day: 0,
        date: new Date(d)
      };
    }
    
    records.forEach(record => {
      try {
        const date = new Date(record.date).toISOString().split('T')[0];
        if (dailyMap[date]) {
          if (record.status === 'PRESENT') dailyMap[date].present++;
          else if (record.status === 'ABSENT') dailyMap[date].absent++;
          else if (record.status === 'HALF_DAY') dailyMap[date].half_day++;
        }
      } catch (e) {
        console.error('Error processing record date:', e);
      }
    });
    
    const sortedDates = Object.keys(dailyMap).sort();
    const dailyStatsArray = sortedDates.map(date => ({
      date: dailyMap[date].date,
      present: dailyMap[date].present,
      absent: dailyMap[date].absent,
      half_day: dailyMap[date].half_day,
      name: formatDateShort(dailyMap[date].date)
    }));
    
    setDailyStats(dailyStatsArray);
  };

const fetchEmployeeData = async (employeeId) => {
  try {
    setLoading(true);
    setError('');
    
    const empRes = await axios.get(`employees/employees/${employeeId}/`);
    setSelectedEmployee(empRes.data);
    
    const attRes = await axios.get(
      `employees/attendance/?employee_id=${employeeId}&start_date=${dateRange.start.toISOString().split('T')[0]}&end_date=${dateRange.end.toISOString().split('T')[0]}`
    );
    
    const empRecords = attRes.data.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= dateRange.start && recordDate <= dateRange.end;
    });
    
    const presentCount = empRecords.filter(r => r.status === 'PRESENT').length;
    const absentCount = empRecords.filter(r => r.status === 'ABSENT').length;
    const half_dayCount = empRecords.filter(r => r.status === 'HALF_DAY').length;
    
    const presentDays = empRecords.filter(r => r.status === 'PRESENT' && r.total_hours);
    const totalHours = presentDays.reduce((sum, emp) => sum + parseFloat(emp.total_hours || 0), 0);
    const avgHours = presentDays.length > 0 ? (totalHours / presentDays.length).toFixed(1) : '0.0';
    
    setEmployeeStats({
      present: presentCount,
      absent: absentCount,
      half_day: half_dayCount,
      total: empRecords.length,
      averageHours: avgHours,
      records: empRecords
    });
    
    setViewMode('employee');
  } catch (err) {
    console.error('Error fetching employee data:', err);
    setError('Failed to fetch employee data');
  } finally {
    setLoading(false);
  }
};
  const getPieData = () => {
    const countMap = {};
    attendanceRecords.forEach((record) => {
      if (record.status === 'PRESENT') {
        const dept = deptMap[record.employee] || 'Unknown';
        countMap[dept] = (countMap[dept] || 0) + 1;
      }
    });
    return Object.entries(countMap).map(([name, value]) => ({ name, value }));
  };

  const getBarData = () => {
    const statusCount = {
      PRESENT: 0,
      ABSENT: 0,
      HALF_DAY: 0
    };
    
    attendanceRecords.forEach(record => {
      if (statusCount.hasOwnProperty(record.status)) {
        statusCount[record.status]++;
      }
    });
    
    return Object.entries(statusCount).map(([name, value]) => ({
      name,
      value
    }));
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '-';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return '-';
    }
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return '-';
    }
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      PRESENT: {
        color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200',
        icon: <BsCheckCircleFill className="text-green-500 dark:text-green-400" />
      },
      ABSENT: {
        color: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200',
        icon: <BsXCircleFill className="text-red-500 dark:text-red-400" />
      },
      HALF_DAY: {
        color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200',
        icon: <BsClockHistory className="text-yellow-500 dark:text-yellow-400" />
      },
      LEAVE: {
        color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200',
        icon: <FiClock className="text-blue-500 dark:text-blue-400" />
      }
    };

    const config = statusConfig[status] || {
      color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      icon: <FiClock className="text-gray-500 dark:text-gray-400" />
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{status}</span>
      </span>
    );
  };

  const TrendIndicator = ({ value }) => {
    if (value > 0) {
      return (
        <span className="inline-flex items-center text-red-500 dark:text-red-400">
          <FiTrendingUp className="mr-1" />
          {value}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="inline-flex items-center text-green-500 dark:text-green-400">
          <FiTrendingDown className="mr-1" />
          {Math.abs(value)}%
        </span>
      );
    }
    return <span className="text-gray-500 dark:text-gray-400">0%</span>;
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         record.employee?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;
    const matchesDept = deptFilter === 'ALL' || deptMap[record.employee] === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const uniqueDepartments = [...new Set(Object.values(deptMap))].filter(Boolean);

const exportToExcel = async () => {
  if (!exportStartDate || !exportEndDate) {
    setError('Please select both start and end dates');
    return;
  }

  try {
    setExportLoading(true);
    setError('');
    
    const allRecordsResponse = await axios.get(
      `employees/attendance/?start_date=${exportStartDate}&end_date=${exportEndDate}`
    );
    
    let records = allRecordsResponse.data;
    if (exportEmployeeId) {
      records = records.filter(record => record.employee === exportEmployeeId);
    }

    const startDate = new Date(exportStartDate);
    const endDate = new Date(exportEndDate);
    
    records = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });

    if (records.length === 0) {
      setError('No records found for the selected date range' + (exportEmployeeId ? ' and employee' : ''));
      return;
    }

      records.sort((a, b) => new Date(b.date) - new Date(a.date));

      const data = records.map(record => {
        let formattedDate = '-';
        try {
          formattedDate = new Date(record.date).toLocaleDateString('en-GB');
        } catch (e) {
          console.error('Error formatting date:', e);
        }
        
        const formatTime = (timeString) => {
          if (!timeString || record.status === 'ABSENT') return '-';
          try {
            const date = new Date(timeString);
            return date.toLocaleTimeString('en-GB', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true
            });
          } catch (e) {
            return '-';
          }
        };

        let duration = '-';
        if (record.status === 'PRESENT' && record.check_in && record.check_out) {
          try {
            const start = new Date(record.check_in);
            const end = new Date(record.check_out);
            const diff = (end - start) / (1000 * 60 * 60);
            duration = diff.toFixed(2);
          } catch (e) {
            console.error('Error calculating duration:', e);
          }
        }

        return {
          'Employee ID': record.employee,
          'Employee Name': record.employee_name,
          'Date': formattedDate,
          'Status': record.status,
          'Check In': formatTime(record.check_in),
          'Check Out': formatTime(record.check_out),
          'Total Hours': duration,
          'Department': deptMap[record.employee] || 'Unknown',
          'Remarks': record.remarks || '-'
        };
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      const wscols = [
        {wch: 30}, {wch: 20}, {wch: 12}, {wch: 10}, 
        {wch: 12}, {wch: 12}, {wch: 12}, {wch: 20}, {wch: 20}
      ];
      worksheet['!cols'] = wscols;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Records');
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      let filename;
      if (exportEmployeeId) {
        const employee = allEmployees.find(e => e.employee_id === exportEmployeeId);
        filename = `Attendance_${employee?.first_name || 'Employee'}_${exportStartDate}_to_${exportEndDate}.xlsx`;
      } else {
        filename = `Attendance_All_Employees_${exportStartDate}_to_${exportEndDate}.xlsx`;
      }
      
      saveAs(blob, filename);
      
      setSuccessMessage(`Exported ${records.length} attendance records`);
      setTimeout(() => setSuccessMessage(''), 5000);
      setExportModalOpen(false);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export attendance data');
    } finally {
      setExportLoading(false);
    }
  };

  const ExportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button 
          onClick={() => setExportModalOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <FiX size={20} />
        </button>
        
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <FiDownload className="mr-2 text-indigo-600 dark:text-indigo-400" />
          Export Attendance Records
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-300"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-300"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Employee (Optional)
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-300"
              value={exportEmployeeId}
              onChange={(e) => setExportEmployeeId(e.target.value)}
            >
              <option value="">All Employees</option>
              {allEmployees.map(emp => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.first_name} (ID: {emp.employee_id})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setExportModalOpen(false)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={exportToExcel}
            disabled={exportLoading}
            className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center"
          >
            {exportLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <FiDownload className="mr-2" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

 const EmployeeProfileView = () => {
  if (!selectedEmployee || !employeeStats) return null;

  const handleExportEmployee = () => {
    // Set the employee ID and date range for export
    setExportEmployeeId(selectedEmployee.employee_id);
    setExportStartDate(dateRange.start.toISOString().split('T')[0]);
    setExportEndDate(dateRange.end.toISOString().split('T')[0]);
    setExportModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors mb-6">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setViewMode('overview');
              setCurrentPage(1);
            }}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiChevronLeft className="text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <span className="text-indigo-600 dark:text-indigo-400 font-medium text-xl">
                {selectedEmployee.first_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {selectedEmployee.first_name} {selectedEmployee.last_name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {deptMap[selectedEmployee.employee_id] || 'Unknown Department'} • ID: {selectedEmployee.employee_id}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleExportEmployee}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm text-sm font-medium transition-colors"
        >
          <FiDownload className="mr-1" />
          Export Records
        </button>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Present Days</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{employeeStats.present}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {employeeStats.total > 0 ? `${Math.round((employeeStats.present / employeeStats.total) * 100)}% of total` : 'No data'}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Absent Days</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{employeeStats.absent}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {employeeStats.total > 0 ? `${Math.round((employeeStats.absent / employeeStats.total) * 100)}% of total` : 'No data'}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Half Day</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{employeeStats.half_day}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {employeeStats.total > 0 ? `${Math.round((employeeStats.half_day / employeeStats.total) * 100)}% of total` : 'No data'}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Hours Worked</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{employeeStats.averageHours}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {employeeStats.present > 0 ? `on ${employeeStats.present} present days` : 'No data'}
            </p>
          </div>
        </div>

        <div className="px-6 py-4">
          <h4 className="text-md font-medium text-gray-800 dark:text-white mb-4">
            Attendance Records ({formatDate(dateRange.start)} to {formatDate(dateRange.end)})
          </h4>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Check-In
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Check-Out
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {employeeStats.records.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No attendance records found for this period
                    </td>
                  </tr>
                ) : (
                  employeeStats.records.map((record, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatTime(record.check_in)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {record.check_out ? formatTime(record.check_out) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {record.total_hours || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen overflow-x-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <FiCalendar className="mr-2 text-indigo-600 dark:text-indigo-400" />
              {viewMode === 'overview' ? 'Attendance Dashboard' : 'Employee Attendance'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {viewMode === 'overview' ? (
                <>
                  Showing data from {formatDate(dateRange.start)} to {formatDate(dateRange.end)}
                </>
              ) : (
                <>
                  Viewing attendance for {selectedEmployee?.first_name} {selectedEmployee?.last_name}
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {viewMode === 'overview' && (
              <>
                <div className="flex items-center gap-2">
                  <DatePicker
                    selected={dateRange.start}
                    onChange={(date) => {
                      setDateRange(prev => ({...prev, start: date}));
                      setCurrentPage(1);
                    }}
                    selectsStart
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    maxDate={dateRange.end}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-700 dark:text-gray-300 w-36"
                  />
                  <span className="text-gray-500 dark:text-gray-400">to</span>
                  <DatePicker
                    selected={dateRange.end}
                    onChange={(date) => {
                      setDateRange(prev => ({...prev, end: date}));
                      setCurrentPage(1);
                    }}
                    selectsEnd
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    minDate={dateRange.start}
                    maxDate={new Date()}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-700 dark:text-gray-300 w-36"
                  />
                </div>
                <button 
                  onClick={() => {
                    setExportStartDate(dateRange.start.toISOString().split('T')[0]);
                    setExportEndDate(dateRange.end.toISOString().split('T')[0]);
                    setExportModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm text-sm font-medium transition-colors"
                >
                  <FiDownload className="mr-1" />
                  Export
                </button>
              </>
            )}
            <button 
              onClick={() => {
                fetchData();
                setCurrentPage(1);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
            >
              <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="font-medium">Last updated:</span> {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded mb-6 flex justify-between items-center">
            <p>{error}</p>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <FiX />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 rounded mb-6 flex justify-between items-center">
            <p>{successMessage}</p>
            <button onClick={() => setSuccessMessage('')} className="text-green-500 hover:text-green-700">
              <FiX />
            </button>
          </div>
        )}

        {/* Main Content - Either Employee View or Overview */}
        {viewMode === 'employee' ? (
          <EmployeeProfileView />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Present Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-700/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Present</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.present}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {stats.total > 0 ? `${Math.round((stats.present / stats.total) * 100)}% of total` : 'No data'}
                    </p>
                    <p className="text-xs mt-1">
                      <TrendIndicator value={comparisonStats.presentChange} />
                      <span className="text-gray-500 dark:text-gray-400 ml-1">from previous period</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/30">
                    <FiUserCheck className="text-green-500 dark:text-green-400 text-xl" />
                  </div>
                </div>
              </div>

              {/* Absent Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-700/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Absent</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.absent}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {stats.total > 0 ? `${Math.round((stats.absent / stats.total) * 100)}% of total` : 'No data'}
                    </p>
                    <p className="text-xs mt-1">
                      <TrendIndicator value={comparisonStats.absentChange} />
                      <span className="text-gray-500 dark:text-gray-400 ml-1">from previous period</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/30">
                    <FiUserX className="text-red-500 dark:text-red-400 text-xl" />
                  </div>
                </div>
              </div>

              {/* Late Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-700/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Half Day</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.half_day}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {stats.total > 0 ? `${Math.round((stats.half_day / stats.total) * 100)}% of total` : 'No data'}
                    </p>
                    <p className="text-xs mt-1">
                      <TrendIndicator value={comparisonStats.half_dayChange} />
                      <span className="text-gray-500 dark:text-gray-400 ml-1">from previous period</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-50 dark:bg-yellow-900/30">
                    <BsClockHistory className="text-yellow-500 dark:text-yellow-400 text-xl" />
                  </div>
                </div>
              </div>

              {/* Avg Hours Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-700/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Hours Worked</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.averageHours}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {stats.present > 0 ? `for ${stats.present} present employees` : 'No data'}
                    </p>
                    <p className="text-xs mt-1">
                      <span className={`inline-flex items-center ${
                        stats.trend === 'up' ? 'text-red-500 dark:text-red-400' : 
                        stats.trend === 'down' ? 'text-green-500 dark:text-green-400' : 
                        'text-gray-500 dark:text-gray-400'
                      }`}>
                        {stats.trend === 'up' ? (
                          <>
                            <FiTrendingUp className="mr-1" />
                            Increased
                          </>
                        ) : stats.trend === 'down' ? (
                          <>
                            <FiTrendingDown className="mr-1" />
                            Decreased
                          </>
                        ) : 'No change'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">from previous</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/30">
                    <IoMdTime className="text-indigo-500 dark:text-indigo-400 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Daily Attendance Trend */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                    <FiTrendingUp className="mr-2 text-indigo-600 dark:text-indigo-400" />
                    Daily Attendance Trend
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(dateRange.start)} to {formatDate(dateRange.end)}
                    </span>
                  </div>
                </div>
                <div className="h-64">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-200"></div>
                    </div>
                  ) : dailyStats.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                      No daily records found.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={dailyStats}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#6b7280"
                          tick={{ fill: '#6b7280' }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fill: '#6b7280' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'var(--bg-color)',
                            borderColor: 'var(--border-color)',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          itemStyle={{
                            color: 'var(--text-color)'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="present" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                          name="Present"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="absent" 
                          stroke="#EF4444" 
                          strokeWidth={2}
                          name="Absent"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="half_day" 
                          stroke="#F59E0B" 
                          strokeWidth={2}
                          name="Half Day"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Status Distribution Bar Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                    <FiBarChart2 className="mr-2 text-indigo-600 dark:text-indigo-400" />
                    Attendance Status
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(dateRange.start)} to {formatDate(dateRange.end)}
                    </span>
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  </div>
                </div>
                <div className="h-64 w-full">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-200"></div>
                    </div>
                  ) : attendanceRecords.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                      No attendance records found.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getBarData()}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#6b7280"
                          tick={{ fill: '#6b7280' }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fill: '#6b7280' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'var(--bg-color)',
                            borderColor: 'var(--border-color)',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          itemStyle={{
                            color: 'var(--text-color)'
                          }}
                        />
                        <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                          {getBarData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                  <FiClock className="mr-2 text-indigo-600 dark:text-indigo-400" />
                  Attendance Records
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {/* Search Input */}
                  <div className="relative flex-grow sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search employees..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <select
                    className="block w-full sm:w-32 pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="HALF DAY">Half day</option>
                  </select>
                  
                  {/* Department Filter */}
                  <select
                    className="block w-full sm:w-40 pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                    value={deptFilter}
                    onChange={(e) => {
                      setDeptFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="ALL">All Departments</option>
                    {uniqueDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="w-full overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Employee
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Check-In
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Check-Out
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Hours
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Department
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-200"></div>
                          </div>
                        </td>
                      </tr>
                    ) : currentRecords.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center justify-center">
                            <FiFilter className="text-3xl text-gray-400 dark:text-gray-500 mb-2" />
                            <p>No records match your filters</p>
                            <button 
                              onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('ALL');
                                setDeptFilter('ALL');
                                setCurrentPage(1);
                              }}
                              className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                            >
                              Clear all filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentRecords.map((record, i) => (
                        <tr 
                          key={record.id || i} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                          onClick={() => fetchEmployeeData(record.employee)}
                        >
                          <td className="px-4 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                  {record.employee_name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[160px]">
                                  {record.employee_name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  ID: {record.employee}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={record.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatTime(record.check_in)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {record.check_out ? formatTime(record.check_out) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {record.total_hours || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 truncate max-w-[120px]">
                              {deptMap[record.employee] || 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-medium text-gray-700 dark:text-gray-300">{indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, filteredRecords.length)}</span> of <span className="font-medium text-gray-700 dark:text-gray-300">{filteredRecords.length}</span> records
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Export Modal */}
      {exportModalOpen && <ExportModal />}
    </div>
  );
};

export default AttendancePanel;