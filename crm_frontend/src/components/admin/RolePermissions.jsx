import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
  PersonAdd,
  PersonRemove,
  Lock,
  LockOpen,
  Search,
  Check,
  VerifiedUser,
  ManageAccounts,
  AttachMoney,
  MonetizationOn,
  DateRange,
} from '@mui/icons-material';

const UserPermissionsUI = () => {
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState({ 
    employees: true, 
    salaries: false,
    form: false 
  });
  const [formData, setFormData] = useState({
    employee_id: '',
    app_label: '',
    model_name: '',
    permissions: []
  });
  const [salaryForm, setSalaryForm] = useState({
    employee: '',
    base_salary: '',
    bonus: '',
    deductions: '',
    effective_from: '',
    effective_to: '',
    is_current: true
  });
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  const permissionOptions = ['view', 'add', 'change', 'delete'];
  const modelOptions = [
    { app_label: 'auth', model_name: 'User' },
    { app_label: 'auth', model_name: 'Group' },
    { app_label: 'employees', model_name: 'Employee' },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(prev => ({ ...prev, employees: true }));
        setError(null);
        
        // Fetch employees from /employees/employees/ endpoint
        const employeesResponse = await axiosInstance.get('/employees/employees/');
        
        if (!Array.isArray(employeesResponse?.data)) {
          throw new Error('Invalid employee data format');
        }
        
        setEmployees(employeesResponse.data);
        
        // Only fetch salaries if on the salary management tab
        if (tabValue === 2) {
          setLoading(prev => ({ ...prev, salaries: true }));
          const salariesResponse = await axiosInstance.get('/admin/salary/');
          setSalaries(Array.isArray(salariesResponse?.data) ? salariesResponse.data : []);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('Failed to load employee data. Please try again later.');
        setEmployees([]);
        setSalaries([]);
      } finally {
        setLoading(prev => ({ 
          ...prev, 
          employees: false,
          salaries: false
        }));
      }
    };

    fetchInitialData();
  }, [tabValue]);

  const fetchSalaries = async () => {
    setLoading(prev => ({ ...prev, salaries: true }));
    setError(null);
    try {
      const response = await axiosInstance.get('/admin/salary/');
      setSalaries(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to load salaries:', err);
      setError('Failed to load salary data.');
      setSalaries([]);
    } finally {
      setLoading(prev => ({ ...prev, salaries: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, form: true }));
    setSuccessMessage(null);
    setError(null);
    
    try {
      const endpoint = tabValue === 0 
        ? '/admin/user-permissions/assign_model_permissions/'
        : '/admin/user-permissions/revoke_model_permissions/';
      
      await axiosInstance.post(endpoint, {
        ...formData,
        permissions: Array.isArray(formData.permissions) ? formData.permissions : []
      });
      
      setSuccessMessage(
        tabValue === 0 
          ? 'Permissions successfully assigned!' 
          : 'Permissions successfully revoked!'
      );
      
      // Reset form but keep selected employee if needed
      setFormData(prev => ({
        ...prev,
        app_label: '',
        model_name: '',
        permissions: []
      }));
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to process request:', err);
      setError(err.response?.data?.message || 'Failed to process request. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, form: true }));
    setSuccessMessage(null);
    setError(null);
    
    try {
      await axiosInstance.post('/admin/salary/', {
        ...salaryForm,
        base_salary: parseFloat(salaryForm.base_salary) || 0,
        bonus: parseFloat(salaryForm.bonus) || 0,
        deductions: parseFloat(salaryForm.deductions) || 0
      });
      
      setSuccessMessage('Salary successfully assigned!');
      setSalaryForm({
        employee: '',
        base_salary: '',
        bonus: '',
        deductions: '',
        effective_from: '',
        effective_to: '',
        is_current: true
      });
      
      fetchSalaries();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to assign salary:', err);
      setError(err.response?.data?.message || 'Failed to assign salary. Please check the data and try again.');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const togglePermission = (permission) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      
      return {
        ...prev,
        permissions: newPermissions
      };
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <ManageAccounts className="text-primary-600 dark:text-secondary-400" fontSize="large" />
                User Management Dashboard
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                {tabValue === 0 ? 'Grant access to system resources' : 
                 tabValue === 1 ? 'Remove access from system resources' : 
                 'Manage employee salaries'}
              </p>
            </div>
            <div className="hidden md:block bg-primary-100 dark:bg-secondary-900 rounded-full p-3">
              <VerifiedUser className="text-primary-600 dark:text-secondary-400" fontSize="large" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
            <span className="text-red-800 dark:text-red-200 font-medium">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
            <Check className="text-green-600 dark:text-green-400 mr-3" />
            <span className="text-green-800 dark:text-green-200 font-medium">{successMessage}</span>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setTabValue(0)}
                className={`flex-1 py-5 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-3 transition-colors duration-300 ${
                  tabValue === 0 
                    ? 'border-primary-500 text-primary-600 dark:border-secondary-500 dark:text-secondary-400 bg-primary-50 dark:bg-secondary-900/30' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <PersonAdd className="h-5 w-5" />
                Assign Permissions
              </button>
              <button
                onClick={() => setTabValue(1)}
                className={`flex-1 py-5 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-3 transition-colors duration-300 ${
                  tabValue === 1 
                    ? 'border-primary-500 text-primary-600 dark:border-secondary-500 dark:text-secondary-400 bg-primary-50 dark:bg-secondary-900/30' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <PersonRemove className="h-5 w-5" />
                Revoke Permissions
              </button>
              <button
                onClick={() => setTabValue(2)}
                className={`flex-1 py-5 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-3 transition-colors duration-300 ${
                  tabValue === 2 
                    ? 'border-primary-500 text-primary-600 dark:border-secondary-500 dark:text-secondary-400 bg-primary-50 dark:bg-secondary-900/30' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <AttachMoney className="h-5 w-5" />
                Salary Management
              </button>
            </nav>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {tabValue !== 2 ? (
              <form onSubmit={handleSubmit}>
                {/* Employee Search */}
                <div className="mb-8">
                  <label htmlFor="employee-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <span className="flex items-center gap-2">
                      <span className="bg-primary-100 dark:bg-secondary-900 text-primary-800 dark:text-secondary-200 rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                      Select Employee
                    </span>
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    {loading.employees ? (
                      <div className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-100 placeholder-gray-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400">
                        Loading employees...
                      </div>
                    ) : (
                      <>
                        <input
                          list="employees"
                          id="employee-search"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-secondary-500 dark:focus:border-secondary-500 transition-all duration-200"
                          placeholder="Type or select an employee"
                          value={formData.employee_id}
                          onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                          required
                        />
                        <datalist id="employees">
                          {employees.map(employee => (
                            <option 
                              key={employee.employee_id} 
                              value={employee.employee_id}
                            >
                              {`${employee.first_name} ${employee.last_name} (${employee.employee_id})`}
                            </option>
                          ))}
                        </datalist>
                      </>
                    )}
                  </div>
                </div>

                {/* Model Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <label htmlFor="app_label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <span className="flex items-center gap-2">
                        <span className="bg-primary-100 dark:bg-secondary-900 text-primary-800 dark:text-secondary-200 rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                        Application
                      </span>
                    </label>
                    <select
                      id="app_label"
                      value={formData.app_label}
                      onChange={(e) => setFormData({
                        ...formData,
                        app_label: e.target.value,
                        model_name: ''
                      })}
                      className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-secondary-500 dark:focus:border-secondary-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select Application</option>
                      {[...new Set(modelOptions.map(m => m.app_label))].map(app => (
                        <option key={app} value={app}>{app}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="model_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <span className="flex items-center gap-2">
                        <span className="bg-primary-100 dark:bg-secondary-900 text-primary-800 dark:text-secondary-200 rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                        Model
                      </span>
                    </label>
                    <select
                      id="model_name"
                      value={formData.model_name}
                      onChange={(e) => setFormData({
                        ...formData,
                        model_name: e.target.value
                      })}
                      disabled={!formData.app_label}
                      className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-secondary-500 dark:focus:border-secondary-500 disabled:opacity-50 transition-all duration-200"
                      required
                    >
                      <option value="">Select Model</option>
                      {modelOptions
                        .filter(m => m.app_label === formData.app_label)
                        .map(model => (
                          <option key={model.model_name} value={model.model_name}>
                            {model.model_name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Permissions Selection */}
                <div className="mb-10">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    <span className="flex items-center gap-2">
                      <span className="bg-primary-100 dark:bg-secondary-900 text-primary-800 dark:text-secondary-200 rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
                      Select Permissions
                    </span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {permissionOptions.map((perm) => (
                      <div
                        key={perm}
                        onClick={() => togglePermission(perm)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between ${
                          formData.permissions.includes(perm)
                            ? 'border-primary-500 bg-primary-50 dark:bg-secondary-900 dark:border-secondary-500 shadow-inner scale-[0.98]'
                            : 'border-gray-200 hover:border-primary-300 dark:border-gray-600 dark:hover:border-secondary-400 hover:shadow-md'
                        }`}
                      >
                        <span className="capitalize font-medium text-gray-800 dark:text-gray-200">
                          {perm}
                        </span>
                        {formData.permissions.includes(perm) ? (
                          <div className="w-5 h-5 bg-primary-500 dark:bg-secondary-500 rounded-full flex items-center justify-center text-white">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-500 rounded-full" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {formData.permissions.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Selected permissions:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-secondary-900 dark:text-secondary-200 border border-primary-200 dark:border-secondary-700"
                          >
                            {perm}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePermission(perm);
                              }}
                              className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-primary-600 hover:bg-primary-200 hover:text-primary-800 dark:text-secondary-400 dark:hover:bg-secondary-800 dark:hover:text-secondary-200 transition-colors duration-200"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="mt-10">
                  <button
                    type="submit"
                    disabled={loading.form || !formData.employee_id}
                    className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white ${
                      tabValue === 0 
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700' 
                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      tabValue === 0 
                        ? 'focus:ring-primary-500' 
                        : 'focus:ring-red-500'
                    } transition-all duration-300 ${
                      (loading.form || !formData.employee_id) ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-1'
                    }`}
                  >
                    {loading.form ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : tabValue === 0 ? (
                      <>
                        <LockOpen className="-ml-1 mr-3 h-5 w-5" />
                        Assign Selected Permissions
                      </>
                    ) : (
                      <>
                        <Lock className="-ml-1 mr-3 h-5 w-5" />
                        Revoke Selected Permissions
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                {/* Salary Assignment Form */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <MonetizationOn className="text-primary-600 dark:text-secondary-400" />
                    Assign New Salary
                  </h2>
                  <form onSubmit={handleSalarySubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Employee Selection */}
                      <div>
                        <label htmlFor="salary-employee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Employee
                        </label>
                        <select
                          id="salary-employee"
                          value={salaryForm.employee}
                          onChange={(e) => setSalaryForm({...salaryForm, employee: e.target.value})}
                          className="w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-secondary-500 dark:focus:border-secondary-500"
                          required
                          disabled={loading.employees}
                        >
                          <option value="">Select Employee</option>
                          {employees.map(employee => (
                            <option key={employee.employee_id} value={employee.employee_id}>
                              {`${employee.first_name} ${employee.last_name} (${employee.employee_id})`}
                            </option>
                          ))}
                        </select>
                        {loading.employees && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Loading employees...</p>
                        )}
                      </div>

                      {/* Base Salary */}
                      <div>
                        <label htmlFor="base-salary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Base Salary
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            id="base-salary"
                            value={salaryForm.base_salary}
                            onChange={(e) => setSalaryForm({...salaryForm, base_salary: e.target.value})}
                            className="block w-full pl-7 pr-12 py-3 border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-secondary-500 dark:focus:border-secondary-500"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            required
                          />
                        </div>
                      </div>

                      {/* Bonus */}
                      <div>
                        <label htmlFor="bonus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Bonus
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            id="bonus"
                            value={salaryForm.bonus}
                            onChange={(e) => setSalaryForm({...salaryForm, bonus: e.target.value})}
                            className="block w-full pl-7 pr-12 py-3 border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-secondary-500 dark:focus:border-secondary-500"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>

                      {/* Deductions */}
                      <div>
                        <label htmlFor="deductions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Deductions
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            id="deductions"
                            value={salaryForm.deductions}
                            onChange={(e) => setSalaryForm({...salaryForm, deductions: e.target.value})}
                            className="block w-full pl-7 pr-12 py-3 border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-secondary-500 dark:focus:border-secondary-500"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>

                      {/* Effective Dates */}
                      <div>
                        <label htmlFor="effective-from" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Effective From
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DateRange className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="effective-from"
                            value={salaryForm.effective_from}
                            onChange={(e) => setSalaryForm({...salaryForm, effective_from: e.target.value})}
                            className="block w-full pl-10 py-3 border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-secondary-500 dark:focus:border-secondary-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="effective-to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Effective To (Optional)
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DateRange className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="effective-to"
                            value={salaryForm.effective_to}
                            onChange={(e) => setSalaryForm({...salaryForm, effective_to: e.target.value})}
                            className="block w-full pl-10 py-3 border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-secondary-500 dark:focus:border-secondary-500"
                          />
                        </div>
                      </div>

                      {/* Current Status */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is-current"
                          checked={salaryForm.is_current}
                          onChange={(e) => setSalaryForm({...salaryForm, is_current: e.target.checked})}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-secondary-500"
                        />
                        <label htmlFor="is-current" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Mark as current salary
                        </label>
                      </div>
                    </div>

                    <div className="mt-8">
                      <button
                        type="submit"
                        disabled={loading.form}
                        className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loading.form ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <AttachMoney className="-ml-1 mr-3 h-5 w-5" />
                            Assign Salary
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Salary List */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <MonetizationOn className="text-primary-600 dark:text-secondary-400" />
                    Current Salaries
                  </h2>
                  
                  {loading.salaries ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : salaries.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                      <p className="text-gray-500 dark:text-gray-400">No salary records found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Employee
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Base Salary
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Bonus
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Deductions
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Total
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Period
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {salaries.map((salary) => {
                            const employee = employees.find(e => e.employee_id === salary.employee);
                            const base = parseFloat(salary.base_salary) || 0;
                            const bonus = parseFloat(salary.bonus) || 0;
                            const deductions = parseFloat(salary.deductions) || 0;
                            const total = base + bonus - deductions;
                            
                            return (
                              <tr key={salary.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-secondary-900 flex items-center justify-center">
                                      <span className="text-primary-600 dark:text-secondary-400 font-medium">
                                        {employee ? `${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}` : '--'}
                                      </span>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee'}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {salary.employee}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {formatCurrency(base)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {formatCurrency(bonus)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {formatCurrency(deductions)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600 dark:text-secondary-400">
                                  {formatCurrency(total)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  <div>
                                    {formatDate(salary.effective_from)}
                                  </div>
                                  {salary.effective_to && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                      to {formatDate(salary.effective_to)}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    salary.is_current 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                  }`}>
                                    {salary.is_current ? 'Current' : 'Historical'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserPermissionsUI;