import React, { useState, useEffect } from 'react';
import useTheme from '../../hooks/useTheme';
import axiosInstance from '../../api/axiosInstance';
import { useForm } from 'react-hook-form';

const SettingsPanel = () => {
  const { theme, toggleTheme } = useTheme();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  
  const { 
    register: registerPassword, 
    handleSubmit: handlePasswordSubmit, 
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
    watch: watchPassword
  } = useForm();

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/admin/change-requests/');
      
      if (response.data && Array.isArray(response.data)) {
        setPendingRequests(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setError(error.response?.data?.detail || error.message || 'Failed to fetch requests');
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (data) => {
    try {
      setPasswordMessage('');
      setPasswordError('');
      
      const response = await axiosInstance.post('/employees/auth/change-password/', {
        old_password: data.oldPassword,
        new_password: data.newPassword
      });
      
      setPasswordMessage(response.data.message || 'Password changed successfully');
      resetPasswordForm();
    } catch (error) {
      setPasswordError(error.response?.data?.detail || error.response?.data?.error || 'Failed to change password');
    }
  };

  const handleStatusChange = async (id, action) => {
    try {
      setUpdatingId(id);
      setError(null);
      await axiosInstance.patch(`/admin/change-requests/${id}/`, { action });
      // Remove the processed request from local state
      setPendingRequests(prev => prev.filter(req => req.id !== id));
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.response?.data?.detail || 'Failed to update request');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className={`min-h-screen p-4 max-w-6xl mx-auto transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              ⚙️ Settings Panel
            </h1>
            <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
              Manage your account and pending change requests
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 shadow-sm ${
              theme === 'dark' 
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400 border border-gray-600' 
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <>
                <span className="text-lg">☀️</span> Light Mode
              </>
            ) : (
              <>
                <span className="text-lg">🌙</span> Dark Mode
              </>
            )}
          </button>
        </div>

        {/* Password Change Card */}
        <div className={`border rounded-xl shadow-lg overflow-hidden transition-colors duration-300 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-lg ${
                theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
              }`}>
                <span className="text-xl">🔒</span>
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                  Change Password
                </h2>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Update your account password
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit(handlePasswordChange)} className="space-y-4">
              <div>
                <label htmlFor="oldPassword" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Current Password
                </label>
                <input
                  id="oldPassword"
                  type="password"
                  {...registerPassword('oldPassword', { required: 'Current password is required' })}
                  className={`w-full p-2 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-700'} ${
                    passwordErrors.oldPassword ? 'border-red-500' : ''
                  }`}
                />
                {passwordErrors.oldPassword && (
                  <p className="mt-1 text-sm text-red-500">{passwordErrors.oldPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  {...registerPassword('newPassword', { 
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                  className={`w-full p-2 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-700'} ${
                    passwordErrors.newPassword ? 'border-red-500' : ''
                  }`}
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...registerPassword('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => 
                      value === watchPassword('newPassword') || 'Passwords do not match'
                  })}
                  className={`w-full p-2 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-700'} ${
                    passwordErrors.confirmPassword ? 'border-red-500' : ''
                  }`}
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              {passwordMessage && (
                <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}`}>
                  {passwordMessage}
                </div>
              )}

              {passwordError && (
                <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}`}>
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Change Password
              </button>
            </form>
          </div>
        </div>

        {/* Pending Requests Card */}
        <div className={`border rounded-xl shadow-lg overflow-hidden transition-colors duration-300 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-lg ${
                theme === 'dark' ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
              }`}>
                <span className="text-xl">📋</span>
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                  Pending Change Requests
                </h2>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Review and approve pending employee updates
                </p>
              </div>
            </div>

            {error && (
              <div className={`p-3 mb-4 rounded-md ${theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}`}>
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                          {request.employee_name} - {request.field_name}
                        </h3>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Old Value</p>
                            <p className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>{request.old_value}</p>
                          </div>
                          <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>New Value</p>
                            <p className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>{request.new_value}</p>
                          </div>
                        </div>
                        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Reason: {request.reason || 'No reason provided'}
                        </p>
                        <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          Requested at: {new Date(request.requested_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(request.id, 'approve')}
                          disabled={updatingId === request.id}
                          className={`px-3 py-1 rounded text-sm ${
                            updatingId === request.id
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {updatingId === request.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleStatusChange(request.id, 'reject')}
                          disabled={updatingId === request.id}
                          className={`px-3 py-1 rounded text-sm ${
                            updatingId === request.id
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          {updatingId === request.id ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                    <div className={`mt-2 text-sm px-2 py-1 rounded-full inline-block ${
                      theme === 'dark' ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Pending
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center py-12 rounded-lg ${theme === 'dark' ? 'bg-gray-700/20' : 'bg-gray-50'}`}>
                <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className={`mt-4 text-lg font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  No pending requests
                </h3>
                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  When new requests are submitted, they'll appear here
                </p>
                <button
                  onClick={fetchPendingRequests}
                  className={`mt-4 px-4 py-2 rounded-md transition-colors ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;