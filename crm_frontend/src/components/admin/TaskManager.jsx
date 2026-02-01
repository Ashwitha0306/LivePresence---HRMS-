import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { FiPlus, FiSearch, FiCheck, FiX, FiUsers, FiLayers } from 'react-icons/fi';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentDetails, setDepartmentDetails] = useState(null);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    is_active: true,
    manager: '',
    parent_department: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    assignee: '',
    due_date: '',
    priority: 'medium',
    status: 'not_started',
    order: 0,
    is_mandatory: true,
    completion_notes: '',
    depends_on: [],
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [searchTerm, setSearchTerm] = useState('');

  const TASK_STATUS_CHOICES = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    pending_approval: 'Pending Approval',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const PRIORITIES = ['low', 'medium', 'high', 'critical'];

  // Helper function to check dark mode
  const isDarkMode = () => {
    return document.documentElement.classList.contains('dark');
  };

  // Theme-aware styles
  const getThemeClasses = {
    container: isDarkMode() ? 'dark:bg-gray-900' : 'bg-gray-50',
    card: isDarkMode() ? 'dark:bg-gray-800 dark:border-gray-700' : 'bg-white border-gray-200',
    textPrimary: isDarkMode() ? 'dark:text-white' : 'text-gray-900',
    textSecondary: isDarkMode() ? 'dark:text-gray-300' : 'text-gray-700',
    input: isDarkMode() ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : 'bg-white border-gray-300 text-gray-800',
    buttonSecondary: isDarkMode() ? 'dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    tableHeader: isDarkMode() ? 'dark:bg-gray-700 dark:text-gray-300' : 'bg-gray-50 text-gray-500',
    tableRow: isDarkMode() ? 'dark:divide-gray-700 dark:bg-gray-800' : 'divide-gray-200 bg-white',
    tableRowHover: isDarkMode() ? 'dark:hover:bg-gray-700' : 'hover:bg-gray-50',
    successAlert: isDarkMode() ? 'dark:bg-green-900 dark:text-green-100 dark:border-green-800' : 'bg-green-50 text-green-800 border-green-200',
    errorAlert: isDarkMode() ? 'dark:bg-red-900 dark:text-red-100 dark:border-red-800' : 'bg-red-50 text-red-800 border-red-200',
    priorityColors: {
      low: isDarkMode() ? 'dark:bg-blue-900 dark:text-blue-100' : 'bg-blue-100 text-blue-800',
      medium: isDarkMode() ? 'dark:bg-green-900 dark:text-green-100' : 'bg-green-100 text-green-800',
      high: isDarkMode() ? 'dark:bg-yellow-900 dark:text-yellow-100' : 'bg-yellow-100 text-yellow-800',
      critical: isDarkMode() ? 'dark:bg-red-900 dark:text-red-100' : 'bg-red-100 text-red-800'
    },
    statusColors: {
      not_started: isDarkMode() ? 'dark:bg-gray-700 dark:text-gray-100' : 'bg-gray-100 text-gray-800',
      in_progress: isDarkMode() ? 'dark:bg-blue-900 dark:text-blue-100' : 'bg-blue-100 text-blue-800',
      pending_approval: isDarkMode() ? 'dark:bg-purple-900 dark:text-purple-100' : 'bg-purple-100 text-purple-800',
      completed: isDarkMode() ? 'dark:bg-green-900 dark:text-green-100' : 'bg-green-100 text-green-800',
      cancelled: isDarkMode() ? 'dark:bg-red-900 dark:text-red-100' : 'bg-red-100 text-red-800'
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [employeesRes, tasksRes, departmentsRes] = await Promise.all([
          axiosInstance.get('employees/employees/'),
          axiosInstance.get('boarding/tasks/'),
          axiosInstance.get('employees/departments/')
        ]);
        setEmployees(employeesRes.data);
        setTasks(tasksRes.data);
        setDepartments(departmentsRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchDepartmentDetails = async (id) => {
    try {
      const response = await axiosInstance.get(`employees/departments/${id}/`);
      setDepartmentDetails(response.data);
      
      const employeesRes = await axiosInstance.get(`employees/departments/${id}/employees/`);
      setDepartmentDetails(prev => ({
        ...prev,
        employees: employeesRes.data
      }));
    } catch (err) {
      console.error('Failed to fetch department details:', err);
      setError('Failed to load department details.');
    }
  };

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const payload = {
        ...newDepartment,
        manager: newDepartment.manager || null,
        parent_department: newDepartment.parent_department || null
      };

      await axiosInstance.post('employees/departments/', payload);
      setMessage('Department created successfully!');
      setNewDepartment({
        name: '',
        description: '',
        is_active: true,
        manager: '',
        parent_department: ''
      });

      const departmentsRes = await axiosInstance.get('employees/departments/');
      setDepartments(departmentsRes.data);
      setShowDepartmentModal(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create department. Please check required fields.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === 'select-multiple') {
      const values = Array.from(selectedOptions).map((o) => o.value);
      setFormData((prev) => ({ ...prev, [name]: values }));
    } else if (name === 'is_mandatory') {
      setFormData((prev) => ({ ...prev, [name]: value === 'true' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDepartmentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewDepartment(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        department: parseInt(formData.department),
        order: parseInt(formData.order),
        depends_on: formData.depends_on.map((id) => parseInt(id)),
      };

      await axiosInstance.post('boarding/tasks/', payload);
      setMessage('Task created successfully!');

      setFormData({
        name: '',
        description: '',
        department: '',
        assignee: '',
        due_date: '',
        priority: 'medium',
        status: 'not_started',
        order: 0,
        is_mandatory: true,
        completion_notes: '',
        depends_on: [],
      });

      const updatedTasks = await axiosInstance.get('boarding/tasks/');
      setTasks(updatedTasks.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create task. Please check required fields.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.assignee_name && task.assignee_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (task.department_name && task.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={`min-h-screen p-6 space-y-6 max-w-7xl mx-auto ${getThemeClasses.container}`}>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <h1 className={`text-3xl font-bold flex items-center ${getThemeClasses.textPrimary}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Task Management Panel
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'create' ? 'bg-indigo-600 text-white' : getThemeClasses.buttonSecondary}`}
            >
              Create Task
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'view' ? 'bg-indigo-600 text-white' : getThemeClasses.buttonSecondary}`}
            >
              View Tasks
            </button>
            <button
              onClick={() => setShowDepartmentModal(true)}
              className={`px-4 py-2 rounded-lg font-medium ${getThemeClasses.buttonSecondary}`}
            >
              <FiLayers className="inline mr-1" /> Departments
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border flex items-center ${getThemeClasses.successAlert}`}>
          <FiCheck className="mr-2" />
          {message}
          <button onClick={() => setMessage('')} className="ml-auto">
            <FiX />
          </button>
        </div>
      )}
      {error && (
        <div className={`p-4 rounded-lg border flex items-center ${getThemeClasses.errorAlert}`}>
          <FiX className="mr-2" />
          {error}
          <button onClick={() => setError('')} className="ml-auto">
            <FiX />
          </button>
        </div>
      )}

      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-2xl rounded-lg shadow-lg p-6 ${getThemeClasses.card}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Departments</h2>
              <button 
                onClick={() => {
                  setShowDepartmentModal(false);
                  setDepartmentDetails(null);
                }} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`md:col-span-1 rounded-lg p-4 ${isDarkMode() ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Departments List</h3>
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                  {departments.map(dept => (
                    <li 
                      key={dept.id} 
                      onClick={() => fetchDepartmentDetails(dept.id)}
                      className={`p-2 rounded cursor-pointer ${departmentDetails?.id === dept.id ? 
                        (isDarkMode() ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-800') : 
                        (isDarkMode() ? 'hover:bg-gray-600' : 'hover:bg-gray-200')}`}
                    >
                      {dept.name}
                      {!dept.is_active && <span className="ml-2 text-xs text-red-500">(Inactive)</span>}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setDepartmentDetails(null)}
                  className="mt-4 w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  <FiPlus className="inline mr-1" /> Add New Department
                </button>
              </div>

              <div className={`md:col-span-2 rounded-lg p-4 ${isDarkMode() ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {departmentDetails ? (
                  <div>
                    <h3 className="font-medium mb-2 text-gray-900 dark:text-white">{departmentDetails.name}</h3>
                    <p className={`text-sm mb-4 ${isDarkMode() ? 'text-gray-300' : 'text-gray-600'}`}>{departmentDetails.description || 'No description'}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</p>
                        <p className={isDarkMode() ? 'text-white' : 'text-gray-900'}>
                          {departmentDetails.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Manager</p>
                        <p className={isDarkMode() ? 'text-white' : 'text-gray-900'}>
                          {departmentDetails.manager ? 
                            employees.find(e => e.employee_id === departmentDetails.manager)?.first_name + ' ' + 
                            employees.find(e => e.employee_id === departmentDetails.manager)?.last_name : 
                            'Not assigned'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Parent Department</p>
                        <p className={isDarkMode() ? 'text-white' : 'text-gray-900'}>
                          {departmentDetails.parent_department ? 
                            departments.find(d => d.id === departmentDetails.parent_department)?.name : 
                            'None'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Created At</p>
                        <p className={isDarkMode() ? 'text-white' : 'text-gray-900'}>
                          {new Date(departmentDetails.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {departmentDetails.employees && (
                      <div>
                        <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Employees in this department</h4>
                        <div className="space-y-2">
                          {departmentDetails.employees.length > 0 ? (
                            departmentDetails.employees.map(emp => (
                              <div 
                                key={emp.employee_id} 
                                className={`p-2 rounded ${isDarkMode() ? 'bg-gray-600' : 'bg-white'}`}
                              >
                                {emp.first_name} {emp.last_name} ({emp.employee_id})
                              </div>
                            ))
                          ) : (
                            <p className={`text-sm ${isDarkMode() ? 'text-gray-400' : 'text-gray-500'}`}>No employees in this department</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleDepartmentSubmit}>
                    <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Create New Department</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className={`block mb-1 text-sm ${isDarkMode() ? 'text-gray-300' : 'text-gray-700'}`}>Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={newDepartment.name}
                          onChange={handleDepartmentChange}
                          className={`w-full p-2 border rounded ${getThemeClasses.input}`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block mb-1 text-sm ${isDarkMode() ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                        <textarea
                          name="description"
                          value={newDepartment.description}
                          onChange={handleDepartmentChange}
                          rows={3}
                          className={`w-full p-2 border rounded ${getThemeClasses.input}`}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block mb-1 text-sm ${isDarkMode() ? 'text-gray-300' : 'text-gray-700'}`}>Manager</label>
                          <select
                            name="manager"
                            value={newDepartment.manager}
                            onChange={handleDepartmentChange}
                            className={`w-full p-2 border rounded ${getThemeClasses.input}`}
                          >
                            <option value="">Select Manager</option>
                            {employees.map(emp => (
                              <option key={emp.employee_id} value={emp.employee_id}>
                                {emp.first_name} {emp.last_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className={`block mb-1 text-sm ${isDarkMode() ? 'text-gray-300' : 'text-gray-700'}`}>Parent Department</label>
                          <select
                            name="parent_department"
                            value={newDepartment.parent_department}
                            onChange={handleDepartmentChange}
                            className={`w-full p-2 border rounded ${getThemeClasses.input}`}
                          >
                            <option value="">Select Parent Department</option>
                            {departments.map(dept => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={newDepartment.is_active}
                          onChange={handleDepartmentChange}
                          id="is_active"
                          className="mr-2"
                        />
                        <label htmlFor="is_active" className={`text-sm ${isDarkMode() ? 'text-gray-300' : 'text-gray-700'}`}>
                          Active Department
                        </label>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowDepartmentModal(false)}
                          className={`px-4 py-2 rounded-lg ${isDarkMode() ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
                        >
                          {isLoading ? 'Creating...' : 'Create Department'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className={`space-y-6 p-6 rounded-lg shadow border ${getThemeClasses.card}`}>
          <div>
            <label className={`block mb-1 ${getThemeClasses.textSecondary}`}>Task Name *</label>
            <input 
              type="text" 
              name="name" 
              required 
              value={formData.name} 
              onChange={handleChange} 
              className={`w-full p-2 border rounded ${getThemeClasses.input}`} 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block mb-1 ${getThemeClasses.textSecondary}`}>Department *</label>
              <select 
                name="department" 
                required 
                value={formData.department} 
                onChange={handleChange} 
                className={`w-full p-2 border rounded ${getThemeClasses.input}`}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={`block mb-1 ${getThemeClasses.textSecondary}`}>Assign To *</label>
              <select 
                name="assignee" 
                required 
                value={formData.assignee} 
                onChange={handleChange} 
                className={`w-full p-2 border rounded ${getThemeClasses.input}`}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_id})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={`block mb-1 ${getThemeClasses.textSecondary}`}>Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className={`w-full p-2 border rounded ${getThemeClasses.input}`}
              >
                {Object.entries(TASK_STATUS_CHOICES).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={`block mb-1 ${getThemeClasses.textSecondary}`}>Priority</label>
              <select 
                name="priority" 
                value={formData.priority} 
                onChange={handleChange} 
                className={`w-full p-2 border rounded ${getThemeClasses.input}`}
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={`block mb-1 ${getThemeClasses.textSecondary}`}>Deadline</label>
              <input 
                type="date" 
                name="due_date" 
                value={formData.due_date} 
                onChange={handleChange} 
                className={`w-full p-2 border rounded ${getThemeClasses.input}`} 
              />
            </div>
            
            <div>
              <label className={`block mb-1 ${getThemeClasses.textSecondary}`}>Order</label>
              <input 
                type="number" 
                name="order" 
                value={formData.order} 
                onChange={handleChange} 
                className={`w-full p-2 border rounded ${getThemeClasses.input}`} 
              />
            </div>
          </div>
          
          <div>
            <label className={`block mb-1 ${getThemeClasses.textSecondary}`}>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows={3}
              className={`w-full p-2 border rounded ${getThemeClasses.input}`} 
            />
          </div>
          
          <div>
            <label className={`block mb-1 ${getThemeClasses.textSecondary}`}>Completion Notes</label>
            <textarea 
              name="completion_notes" 
              value={formData.completion_notes} 
              onChange={handleChange} 
              rows={2}
              className={`w-full p-2 border rounded ${getThemeClasses.input}`} 
            />
          </div>
          
          <div>
            <label className={`block mb-1 ${getThemeClasses.textSecondary}`}>Depends On (Hold Ctrl to select multiple)</label>
            <select 
              multiple 
              name="depends_on" 
              value={formData.depends_on} 
              onChange={handleChange} 
              className={`w-full p-2 border rounded h-32 ${getThemeClasses.input}`}
            >
              {tasks.map(task => (
                <option key={task.id} value={task.id}>{task.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block mb-1 ${getThemeClasses.textSecondary}`}>Is Mandatory</label>
            <select 
              name="is_mandatory" 
              value={formData.is_mandatory} 
              onChange={handleChange} 
              className={`w-full p-2 border rounded ${getThemeClasses.input}`}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          
          <div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'view' && (
        <div className={`p-6 rounded-xl shadow-lg border ${getThemeClasses.card}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold flex items-center text-gray-900 dark:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              All Tasks
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${getThemeClasses.input}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode() ? 'border-indigo-500' : 'border-indigo-600'}`}></div>
            </div>
          ) : (
            <div className={`overflow-x-auto rounded-lg border ${isDarkMode() ? 'border-gray-700' : 'border-gray-200'}`}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={getThemeClasses.tableHeader}>
                  <tr>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode() ? 'text-gray-300' : 'text-gray-500'}`}>
                      Task Name
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode() ? 'text-gray-300' : 'text-gray-500'}`}>
                      Assignee
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode() ? 'text-gray-300' : 'text-gray-500'}`}>
                      Department
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode() ? 'text-gray-300' : 'text-gray-500'}`}>
                      Status
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode() ? 'text-gray-300' : 'text-gray-500'}`}>
                      Priority
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode() ? 'text-gray-300' : 'text-gray-500'}`}>
                      Deadline
                    </th>
                  </tr>
                </thead>
                <tbody className={getThemeClasses.tableRow}>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className={getThemeClasses.tableRowHover}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`font-medium ${getThemeClasses.textPrimary}`}>{task.name}</div>
                        <div className={`text-sm ${isDarkMode() ? 'text-gray-400' : 'text-gray-500'} line-clamp-1`}>{task.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${getThemeClasses.textPrimary}`}>{task.assignee_name || 'Unassigned'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${getThemeClasses.textPrimary}`}>{task.department_name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getThemeClasses.statusColors[task.status] || (isDarkMode() ? 'bg-gray-600 text-gray-100' : 'bg-gray-100 text-gray-800')}`}>
                          {TASK_STATUS_CHOICES[task.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getThemeClasses.priorityColors[task.priority] || (isDarkMode() ? 'bg-gray-600 text-gray-100' : 'bg-gray-100 text-gray-800')}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode() ? 'text-gray-300' : 'text-gray-500'}`}>
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredTasks.length === 0 && !isLoading && (
            <div className={`text-center py-12 ${isDarkMode() ? 'text-gray-400' : 'text-gray-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium">
                No tasks found
              </h3>
              <p className="mt-1 text-sm">
                {searchTerm ? 'No tasks match your search.' : 'Get started by creating a new task.'}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isDarkMode() ? 'focus:ring-offset-gray-800' : ''}`}
                >
                  <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                  New Task
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskManager;