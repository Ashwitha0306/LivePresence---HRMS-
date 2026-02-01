import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, X, User, Briefcase,
  Phone, Home, HeartPulse, CheckCircle,
  AlertCircle, Clock, Loader2, Search,
  ChevronDown, ChevronUp, Sun, Moon, Filter,
  Award, GraduationCap, BookOpen, Calendar, MapPin, Users, FileText
} from 'lucide-react';
import useTheme from '../../hooks/useTheme';

const UserManagement = () => {
  const { theme, toggleTheme } = useTheme();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editId, setEditId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    contact: true,
    emergency: true,
    additional: true,
    employment: true,
    skills: true,
    experience: true,
    banking: true
  });
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    type: '',
    showFilters: false
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'first_name',
    direction: 'ascending'
  });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    gender: 'M',
    profile_picture: null,
    phone: '',
    alternative_phone: '',
    present_address: '',
    permanent_address: '',
    emergency_contact_name: '',
    emergency_contact_relation: '',
    emergency_contact_phone: '',
    marital_status: 'S',
    blood_group: '',
    nationality: '',
    department: '',
    designation: '',
    reporting_manager: '',
    date_of_joining: '',
    employment_status: 'Active',
    employment_type: 'Full-time',
    bank_name: '',
    account_number: '',
    branch_name: '',
    ifsc_code: '',
    skills: [],
    bio: '',
    is_active: true,
    company_id: ''
  });

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      date_of_birth: '',
      gender: 'M',
      profile_picture: null,
      phone: '',
      alternative_phone: '',
      present_address: '',
      permanent_address: '',
      emergency_contact_name: '',
      emergency_contact_relation: '',
      emergency_contact_phone: '',
      marital_status: 'S',
      blood_group: '',
      nationality: '',
      department: '',
      designation: '',
      reporting_manager: '',
      date_of_joining: '',
      employment_status: 'Active',
      employment_type: 'Full-time',
      bank_name: '',
      account_number: '',
      branch_name: '',
      ifsc_code: '',
      skills: [],
      bio: '',
      is_active: true,
      company_id: ''
    });
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, depsRes, desRes, skillsRes, expRes, eduRes] = await Promise.all([
        axiosInstance.get('employees/employees/'),
        axiosInstance.get('employees/departments/'),
        axiosInstance.get('employees/designations/'),
        axiosInstance.get('employees/skills/'),
        axiosInstance.get('employees/experience/'),
        axiosInstance.get('employees/education/')
      ]);
      setUsers(usersRes.data);
      setDepartments(depsRes.data);
      setDesignations(desRes.data);
      setSkills(skillsRes.data);
      setExperiences(expRes.data);
      setEducation(eduRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle form changes
  const handleChange = useCallback((e) => {
    const { name, value, type, files, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : type === 'checkbox' ? checked : value
    }));
  }, []);

  // Handle skill selection
  const handleSkillChange = useCallback((e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      if (checked) {
        return { ...prev, skills: [...prev.skills, value] };
      } else {
        return { ...prev, skills: prev.skills.filter(skill => skill !== value) };
      }
    });
  }, []);

  // Format date for API submission
  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Prepare the data with properly formatted dates
    const submissionData = {
      ...formData,
      date_of_birth: formatDateForAPI(formData.date_of_birth),
      date_of_joining: formatDateForAPI(formData.date_of_joining)
    };

    const data = new FormData();
    
    // Append all form data to FormData object
    Object.entries(submissionData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => data.append(key, item));
      } else if (value !== null && value !== undefined) {
        data.append(key, value);
      }
    });

    try {
      if (editId) {
        await axiosInstance.patch(`employees/employees/${editId}/`, data);
      } else {
        await axiosInstance.post('employees/employees/', data);
      }
      setIsModalOpen(false);
      setEditId(null);
      resetForm();
      await fetchAllData();
    } catch (err) {
      console.error('Submit error:', err);
      alert("Error: " + JSON.stringify(err?.response?.data || err.message));
    } finally {
      setSubmitting(false);
    }
  }, [editId, formData, resetForm, fetchAllData]);

  // Handle edit
  const handleEdit = useCallback((user) => {
    setFormData({ 
      ...user,
      date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
      date_of_joining: user.date_of_joining ? user.date_of_joining.split('T')[0] : '',
      department: user.department?.id || user.department,
      designation: user.designation?.id || user.designation,
      reporting_manager: user.reporting_manager?.employee_id || user.reporting_manager,
      skills: user.skill_list?.map(skill => skill.id.toString()) || [],
      profile_picture: null
    });
    setEditId(user.employee_id);
    setIsModalOpen(true);
  }, []);

  // Handle view details
  const handleViewDetails = useCallback(async (user) => {
    try {
      const [employeeRes, skillsRes, expRes, eduRes] = await Promise.all([
        axiosInstance.get(`employees/employees/${user.employee_id}/`),
        axiosInstance.get(`employees/skills/?employee=${user.employee_id}`),
        axiosInstance.get(`employees/experience/?employee=${user.employee_id}`),
        axiosInstance.get(`employees/education/?employee=${user.employee_id}`)
      ]);
      setSelectedUser({
        ...employeeRes.data,
        skills: skillsRes.data,
        experiences: expRes.data,
        education: eduRes.data
      });
      setIsDetailModalOpen(true);
    } catch (err) {
      console.error('Error fetching employee details:', err);
    }
  }, []);

  // Handle delete
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axiosInstance.delete(`employees/employees/${id}/`);
      await fetchAllData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  }, [fetchAllData]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply filters and sorting
  const filteredUsers = useMemo(() => {
    let filtered = [...users];
    
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => (
        user.first_name?.toLowerCase().includes(searchTermLower) ||
        user.last_name?.toLowerCase().includes(searchTermLower) ||
        user.email?.toLowerCase().includes(searchTermLower) ||
        (user.department_name && user.department_name.toLowerCase().includes(searchTermLower)) ||
        (user.designation_title && user.designation_title.toLowerCase().includes(searchTermLower))
      ));
    }
    
    if (filters.department) {
      filtered = filtered.filter(user => user.department == filters.department);
    }
    if (filters.status) {
      filtered = filtered.filter(user => user.employment_status === filters.status);
    }
    if (filters.type) {
      filtered = filtered.filter(user => user.employment_type === filters.type);
    }
    
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [users, searchTerm, filters, sortConfig]);

  // Status badge component
  const getStatusBadge = useCallback((status) => {
    const statusConfig = {
      Active: { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', 
        icon: <CheckCircle className="h-3 w-3 mr-1" /> 
      },
      Inactive: { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', 
        icon: <AlertCircle className="h-3 w-3 mr-1" /> 
      }
    };
    const config = statusConfig[status] || {
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', 
      icon: <Clock className="h-3 w-3 mr-1" />
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status}
      </span>
    );
  }, []);

  // Theme classes
  const themeClasses = {
    background: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
    card: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    textPrimary: theme === 'dark' ? 'text-gray-100' : 'text-gray-800',
    textSecondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    input: theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
    buttonPrimary: theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700',
    buttonSecondary: theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50',
    hover: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
    divider: theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate experience duration
  const calculateDuration = (startDate, endDate) => {
    if (!startDate) return 'N/A';
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();
    
    let duration = '';
    if (years > 0) duration += `${years} ${years === 1 ? 'year' : 'years'}`;
    if (months > 0) {
      if (duration) duration += ' ';
      duration += `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    if (!duration) duration = 'Less than a month';
    
    return duration;
  };

  return (
    <div className={`p-1 min-h-screen overflow-hidden ${themeClasses.background}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className={`text-2xl font-bold ${themeClasses.textPrimary}`}>Admin Panel</h1>
            <h2 className={`text-xl font-semibold mt-4 ${themeClasses.textPrimary}`}>Employee Management</h2>
            <p className={themeClasses.textSecondary}>Manage your organization's employees</p>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border ${themeClasses.card} ${themeClasses.border}`}>
          {/* Search and Filters */}
          <div className={`p-4 border-b ${themeClasses.border} flex flex-col gap-4`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search employees..."
                  className={`pl-8 pr-4 py-2 border rounded-lg w-full focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${themeClasses.buttonSecondary} border ${themeClasses.border} ${themeClasses.textPrimary}`}
                  onClick={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-white ${themeClasses.buttonPrimary}`}
                  onClick={() => {
                    resetForm();
                    setEditId(null);
                    setIsModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Employee
                </button>
              </div>
            </div>

            {/* Expanded Filters */}
            {filters.showFilters && (
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Department</label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                  >
                    <option value="">All Departments</option>
                    {departments.map(dep => (
                      <option key={dep.id} value={dep.id}>{dep.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Employment Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Employee List */}
          {loading ? (
              <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col justify-center items-center p-6">
              <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                <User className="h-full w-full" />
              </div>
              <h3 className={`text-lg font-medium ${themeClasses.textPrimary}`}>
                {searchTerm || filters.department || filters.status || filters.type 
                  ? 'No matching employees found' 
                  : 'No employees registered yet'}
              </h3>
              <p className={themeClasses.textSecondary}>
                {searchTerm || filters.department || filters.status || filters.type 
                  ? 'Try adjusting your search or filters' 
                  : 'Add your first employee to get started'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('first_name')}
                    >
                      <div className="flex items-center">
                        <span className={themeClasses.textSecondary}>Name</span>
                        {sortConfig.key === 'first_name' && (
                          sortConfig.direction === 'ascending' 
                            ? <ChevronUp className="ml-1 h-4 w-4" /> 
                            : <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
  scope="col" 
  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
  onClick={() => requestSort('company_id')}
>
  <div className="flex items-center">
    <span className={themeClasses.textSecondary}>Company ID</span>
    {sortConfig.key === 'company_id' && (
      sortConfig.direction === 'ascending' 
        ? <ChevronUp className="ml-1 h-4 w-4" /> 
        : <ChevronDown className="ml-1 h-4 w-4" />
    )}
  </div>
</th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('email')}
                    >
                      <div className="flex items-center">
                        <span className={themeClasses.textSecondary}>Email</span>
                        {sortConfig.key === 'email' && (
                          sortConfig.direction === 'ascending' 
                            ? <ChevronUp className="ml-1 h-4 w-4" /> 
                            : <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('department_name')}
                    >
                      <div className="flex items-center">
                        <span className={themeClasses.textSecondary}>Department</span>
                        {sortConfig.key === 'department_name' && (
                          sortConfig.direction === 'ascending' 
                            ? <ChevronUp className="ml-1 h-4 w-4" /> 
                            : <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={themeClasses.textSecondary}>Status</span>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      <span className={themeClasses.textSecondary}>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${themeClasses.divider}`}>
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.employee_id} 
                      className={`${themeClasses.hover} transition-colors cursor-pointer`}
                      onClick={() => handleViewDetails(user)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                            <span className="text-indigo-600 dark:text-indigo-300 font-medium">
                              {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">ID: {user.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${themeClasses.textPrimary}`}>{user.company_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${themeClasses.textPrimary}`}>{user.email}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${themeClasses.textPrimary}`}>{user.department_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{user.designation_title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.employment_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(user);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(user.employee_id);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Employee Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ${themeClasses.card}`}
            >
              <div className={`sticky top-0 p-4 border-b ${themeClasses.border} flex justify-between items-center z-10 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-bold flex items-center gap-2 ${themeClasses.textPrimary}`}>
                  <User className="h-5 w-5" />
                  {editId ? 'Edit Employee' : 'Add New Employee'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <div 
                      className={`p-3 rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      onClick={() => toggleSection('personal')}
                    >
                      <h3 className={`text-lg font-medium flex items-center justify-between ${themeClasses.textPrimary}`}>
                        <span className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Personal Information
                        </span>
                        {expandedSections.personal ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </h3>
                    </div>
                    
                    {expandedSections.personal && (
                      <div className="space-y-4 pl-2">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>First Name *</label>
                          <input
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="John"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Last Name *</label>
                          <input
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Doe"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Email *</label>
                          <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john.doe@example.com"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Company ID *</label>
                          <input
                            name="company_id"
                            value={formData.company_id}
                            onChange={handleChange}
                            placeholder="EMP-001"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Date of Birth</label>
                          <input
                            name="date_of_birth"
                            type="date"
                            value={formData.date_of_birth || ''}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Gender</label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                          >
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="O">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Profile Picture</label>
                          <input
                            name="profile_picture"
                            type="file"
                            onChange={handleChange}
                            className={`w-full px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold ${
                              theme === 'dark' 
                                ? 'file:bg-blue-900 file:text-blue-200 hover:file:bg-blue-800' 
                                : 'file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <div 
                      className={`p-3 rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      onClick={() => toggleSection('contact')}
                    >
                      <h3 className={`text-lg font-medium flex items-center justify-between ${themeClasses.textPrimary}`}>
                        <span className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contact Information
                        </span>
                        {expandedSections.contact ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </h3>
                    </div>
                    
                    {expandedSections.contact && (
                      <div className="space-y-4 pl-2">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Phone *</label>
                          <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 123-4567"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Alternate Phone</label>
                          <input
                            name="alternative_phone"
                            value={formData.alternative_phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 987-6543"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Present Address</label>
                          <textarea
                            name="present_address"
                            value={formData.present_address}
                            onChange={handleChange}
                            placeholder="123 Main St, City"
                            rows="2"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Permanent Address</label>
                          <textarea
                            name="permanent_address"
                            value={formData.permanent_address}
                            onChange={handleChange}
                            placeholder="456 Oak Ave, Hometown"
                            rows="2"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Emergency Contact */}
                  <div className="space-y-4">
                    <div 
                      className={`p-3 rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      onClick={() => toggleSection('emergency')}
                    >
                      <h3 className={`text-lg font-medium flex items-center justify-between ${themeClasses.textPrimary}`}>
                        <span className="flex items-center gap-2">
                          <HeartPulse className="h-4 w-4" />
                          Emergency Contact
                        </span>
                        {expandedSections.emergency ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </h3>
                    </div>
                    
                    {expandedSections.emergency && (
                      <div className="space-y-4 pl-2">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Name</label>
                          <input
                            name="emergency_contact_name"
                            value={formData.emergency_contact_name}
                            onChange={handleChange}
                            placeholder="Jane Smith"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Relationship</label>
                          <input
                            name="emergency_contact_relation"
                            value={formData.emergency_contact_relation}
                            onChange={handleChange}
                            placeholder="Spouse"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Phone</label>
                          <input
                            name="emergency_contact_phone"
                            value={formData.emergency_contact_phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 789-0123"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <div 
                      className={`p-3 rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      onClick={() => toggleSection('additional')}
                    >
                      <h3 className={`text-lg font-medium flex items-center justify-between ${themeClasses.textPrimary}`}>
                        <span className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Additional Information
                        </span>
                        {expandedSections.additional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </h3>
                    </div>
                    
                    {expandedSections.additional && (
                      <div className="space-y-4 pl-2">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Marital Status</label>
                          <select
                            name="marital_status"
                            value={formData.marital_status}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                          >
                            <option value="S">Single</option>
                            <option value="M">Married</option>
                            <option value="D">Divorced</option>
                            <option value="W">Widowed</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Blood Group</label>
                          <input
                            name="blood_group"
                            value={formData.blood_group}
                            onChange={handleChange}
                            placeholder="O+"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Nationality</label>
                          <input
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleChange}
                            placeholder="American"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Employment Information */}
                  <div className="space-y-4 md:col-span-2">
                    <div 
                      className={`p-3 rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      onClick={() => toggleSection('employment')}
                    >
                      <h3 className={`text-lg font-medium flex items-center justify-between ${themeClasses.textPrimary}`}>
                        <span className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Employment Information
                        </span>
                        {expandedSections.employment ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </h3>
                    </div>
                    
                    {expandedSections.employment && (
                      <div className="space-y-4 pl-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Department *</label>
                            <select
                              name="department"
                              value={formData.department}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                              required
                            >
                              <option value="">Select Department</option>
                              {departments.map(dep => (
                                <option key={dep.id} value={dep.id}>{dep.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Designation *</label>
                            <select
                              name="designation"
                              value={formData.designation}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                              required
                            >
                              <option value="">Select Designation</option>
                              {designations.map(des => (
                                <option key={des.id} value={des.id}>{des.title}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Reporting Manager</label>
                            <select
                              name="reporting_manager"
                              value={formData.reporting_manager}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                            >
                              <option value="">Select Manager</option>
                              {users.map(user => (
                                <option key={user.employee_id} value={user.employee_id}>
                                  {user.first_name} {user.last_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Date of Joining</label>
                            <input
                              name="date_of_joining"
                              type="date"
                              value={formData.date_of_joining || ''}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Employment Status</label>
                            <select
                              name="employment_status"
                              value={formData.employment_status}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Employment Type</label>
                            <select
                              name="employment_type"
                              value={formData.employment_type}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                            >
                              <option value="Full-time">Full-time</option>
                              <option value="Part-time">Part-time</option>
                              <option value="Contract">Contract</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Bio</label>
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Brief description about the employee..."
                            rows="3"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Banking Information */}
                  <div className="space-y-4 md:col-span-2">
                    <div 
                      className={`p-3 rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      onClick={() => toggleSection('banking')}
                    >
                      <h3 className={`text-lg font-medium flex items-center justify-between ${themeClasses.textPrimary}`}>
                        <span className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Banking Information
                        </span>
                        {expandedSections.banking ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </h3>
                    </div>
                    
                    {expandedSections.banking && (
                      <div className="space-y-4 pl-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Bank Name</label>
                            <input
                              name="bank_name"
                              value={formData.bank_name}
                              onChange={handleChange}
                              placeholder="Bank of America"
                              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Account Number</label>
                            <input
                              name="account_number"
                              value={formData.account_number}
                              onChange={handleChange}
                              placeholder="1234567890"
                              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>Branch Name</label>
                            <input
                              name="branch_name"
                              value={formData.branch_name}
                              onChange={handleChange}
                              placeholder="Main Branch"
                              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${themeClasses.textPrimary}`}>IFSC Code</label>
                            <input
                              name="ifsc_code"
                              value={formData.ifsc_code}
                              onChange={handleChange}
                              placeholder="BOFAUS3N"
                              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-4 md:col-span-2">
                    <div 
                      className={`p-3 rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                      onClick={() => toggleSection('skills')}
                    >
                      <h3 className={`text-lg font-medium flex items-center justify-between ${themeClasses.textPrimary}`}>
                        <span className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Skills
                        </span>
                        {expandedSections.skills ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </h3>
                    </div>
                    
                    {expandedSections.skills && (
                      <div className="space-y-4 pl-2">
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <h4 className={`text-sm font-medium mb-3 ${themeClasses.textPrimary}`}>Select Skills</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {skills.map(skill => (
                              <div key={skill.id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`skill-${skill.id}`}
                                  value={skill.id}
                                  checked={formData.skills.includes(skill.id.toString())}
                                  onChange={handleSkillChange}
                                  className={`h-4 w-4 rounded ${theme === 'dark' ? 'text-blue-600 bg-gray-600 border-gray-500' : 'text-blue-600 bg-white border-gray-300'} focus:ring-blue-500`}
                                />
                                <label htmlFor={`skill-${skill.id}`} className={`ml-2 text-sm ${themeClasses.textPrimary}`}>
                                  {skill.skill}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        theme === 'dark' ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      {editId ? 'Update Employee' : 'Add Employee'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Employee Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ${themeClasses.card}`}
            >
              <div className={`sticky top-0 p-4 border-b ${themeClasses.border} flex justify-between items-center z-10 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-bold flex items-center gap-2 ${themeClasses.textPrimary}`}>
                  <User className="h-5 w-5" />
                  Employee Details: {selectedUser.first_name} {selectedUser.last_name}
                </h2>
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Profile Section */}
                  <div className="md:col-span-1">
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} flex flex-col items-center`}>
                      <div className="w-32 h-32 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
                        <span className="text-indigo-600 dark:text-indigo-300 font-medium text-4xl">
                          {selectedUser.first_name?.charAt(0)}{selectedUser.last_name?.charAt(0)}
                        </span>
                      </div>
                      <h3 className={`text-xl font-bold ${themeClasses.textPrimary}`}>
                        {selectedUser.first_name} {selectedUser.last_name}
                      </h3>
                      <p className={`text-sm ${themeClasses.textSecondary}`}>
                        {selectedUser.designation_title}
                      </p>
                      <div className="mt-4">
                        {getStatusBadge(selectedUser.employment_status)}
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.textPrimary}`}>
                        <User className="h-4 w-4" />
                        Basic Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Employee ID</p>
                          <p className={themeClasses.textPrimary}>{selectedUser.employee_id}</p>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Company ID</p>
                          <p className={themeClasses.textPrimary}>{selectedUser.company_id}</p>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Email</p>
                          <p className={themeClasses.textPrimary}>{selectedUser.email}</p>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Phone</p>
                          <p className={themeClasses.textPrimary}>{selectedUser.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Alternate Phone</p>
                          <p className={themeClasses.textPrimary}>{selectedUser.alternative_phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Date of Birth</p>
                          <p className={themeClasses.textPrimary}>{formatDate(selectedUser.date_of_birth)}</p>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Gender</p>
                          <p className={themeClasses.textPrimary}>
                            {selectedUser.gender === 'M' ? 'Male' : 
                             selectedUser.gender === 'F' ? 'Female' : 
                             selectedUser.gender === 'O' ? 'Other' : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Blood Group</p>
                          <p className={themeClasses.textPrimary}>{selectedUser.blood_group || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Marital Status</p>
                          <p className={themeClasses.textPrimary}>
                            {selectedUser.marital_status === 'S' ? 'Single' : 
                             selectedUser.marital_status === 'M' ? 'Married' : 
                             selectedUser.marital_status === 'D' ? 'Divorced' : 
                             selectedUser.marital_status === 'W' ? 'Widowed' : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Nationality</p>
                          <p className={themeClasses.textPrimary}>{selectedUser.nationality || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Banking Info */}
                    {selectedUser.bank_name && (
                      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.textPrimary}`}>
                          <Award className="h-4 w-4" />
                          Banking Information
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Bank Name</p>
                            <p className={themeClasses.textPrimary}>{selectedUser.bank_name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Account Number</p>
                            <p className={themeClasses.textPrimary}>{selectedUser.account_number || 'N/A'}</p>
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Branch Name</p>
                            <p className={themeClasses.textPrimary}>{selectedUser.branch_name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>IFSC Code</p>
                            <p className={themeClasses.textPrimary}>{selectedUser.ifsc_code || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="md:col-span-2">
                    {/* Employment Info */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} mb-6`}>
                      <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.textPrimary}`}>
                        <Briefcase className="h-4 w-4" />
                        Employment Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Department</p>
                          <p className={themeClasses.textPrimary}>{selectedUser.department_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Designation</p>
                          <p className={themeClasses.textPrimary}>{selectedUser.designation_title || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Employment Type</p>
                          <p className={themeClasses.textPrimary}>{selectedUser.employment_type || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Date of Joining</p>
                          <p className={themeClasses.textPrimary}>{formatDate(selectedUser.date_of_joining)}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Reporting Manager</p>
                          <p className={themeClasses.textPrimary}>
                            {selectedUser.reporting_manager_name || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Skills Section */}
                    {selectedUser.skill_list && selectedUser.skill_list.length > 0 && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} mb-6`}>
                        <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.textPrimary}`}>
                          <Award className="h-4 w-4" />
                          Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.skill_list.map((skill, index) => (
                            <span 
                              key={index} 
                              className={`px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'}`}
                            >
                              {skill.skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education Section */}
                    {selectedUser.education && selectedUser.education.length > 0 && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} mb-6`}>
                        <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.textPrimary}`}>
                          <GraduationCap className="h-4 w-4" />
                          Education
                        </h4>
                        <div className="space-y-4">
                          {selectedUser.education.map((edu, index) => (
                            <div key={index} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className={`font-medium ${themeClasses.textPrimary}`}>{edu.institution}</h5>
                                  <p className={`text-sm ${themeClasses.textPrimary}`}>
                                    {edu.degree} in {edu.field_of_study}
                                  </p>
                                </div>
                                <div className={`text-xs ${themeClasses.textSecondary}`}>
                                  {formatDate(edu.start_date)} - {edu.end_date ? formatDate(edu.end_date) : 'Present'}
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className={`text-xs ${themeClasses.textSecondary}`}>
                                  {edu.grade && `Grade: ${edu.grade}`}
                                </p>
                                {edu.description && (
                                  <p className={`text-sm mt-2 ${themeClasses.textPrimary}`}>{edu.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {selectedUser.experiences && selectedUser.experiences.length > 0 && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} mb-6`}>
                        <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.textPrimary}`}>
                          <BookOpen className="h-4 w-4" />
                          Work Experience
                        </h4>
                        <div className="space-y-4">
                          {selectedUser.experiences.map((exp, index) => (
                            <div key={index} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className={`font-medium ${themeClasses.textPrimary}`}>{exp.company || exp.company_name}</h5>
                                  <p className={`text-sm ${themeClasses.textPrimary}`}>{exp.title || exp.position}</p>
                                </div>
                                <div className={`text-xs ${themeClasses.textSecondary}`}>
                                  {formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className={`text-xs ${themeClasses.textSecondary}`}>
                                  {exp.location && `Location: ${exp.location} | `}Duration: {calculateDuration(exp.start_date, exp.end_date)}
                                </p>
                                {exp.description && (
                                  <p className={`text-sm mt-2 ${themeClasses.textPrimary}`}>{exp.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} mb-6`}>
                      <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.textPrimary}`}>
                        <Phone className="h-4 w-4" />
                        Contact Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Present Address</p>
                          <p className={themeClasses.textPrimary}>{selectedUser.present_address || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Permanent Address</p>
                          <p className={themeClasses.textPrimary}>{selectedUser.permanent_address || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.textPrimary}`}>
                        <HeartPulse className="h-4 w-4" />
                        Emergency Contact
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Name</p>
                          <p className={themeClasses.textPrimary}>{selectedUser.emergency_contact_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Relationship</p>
                          <p className={themeClasses.textPrimary}>{selectedUser.emergency_contact_relation || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Phone</p>
                          <p className={themeClasses.textPrimary}>{selectedUser.emergency_contact_phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-4 border-t ${themeClasses.border} flex justify-end gap-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleEdit(selectedUser);
                  }}
                  className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <Edit className="h-4 w-4 mr-2 inline" />
                  Edit Employee
                </button>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    theme === 'dark' ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;