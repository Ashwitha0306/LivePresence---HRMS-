import React, { useState, useContext } from 'react';
import { CheckCircleIcon, XCircleIcon, MoonIcon, SunIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ThemeContext } from '../components/ThemeContext';
import axiosInstance from '../api/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmployeeSettingsPage = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const employeeId = localStorage.getItem('employeeId');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDeleteAvatar = () => {
    setAvatar(null);
    setPreviewUrl('');
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      let passwordChanged = false;

      if (oldPassword && newPassword) {
        await axiosInstance.post('employees/auth/change-password/', {
          old_password: oldPassword,
          new_password: newPassword,
        });
        
        toast.success('Password changed successfully! Please login again.', {
          autoClose: 3000,
        });
        
        passwordChanged = true;
      }

      if (avatar) {
        const formData = new FormData();
        formData.append('profile_picture', avatar);

        if (!employeeId) {
          toast.error('Employee ID not found. Please login again.', {
            autoClose: 3000,
          });
          return;
        }

        await axiosInstance.patch(
          `/employees/employees/${employeeId}/`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        toast.success('Profile picture updated!', {
          autoClose: 3000,
        });
      }

      // Logout if password was changed
      if (passwordChanged) {
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/employees/login';
        }, 3000);
      }

    } catch (err) {
      console.error(err);
      
      const errorMessage = 
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to save changes.';
      
      toast.error(errorMessage, {
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-300">
      {/* Add ToastContainer here */}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />
      
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden relative">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 w-full"></div>
        
        {/* Theme Toggle in Top Right Corner */}
        <button
          onClick={handleThemeToggle}
          className="absolute top-4 right-4 flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm"
          title="Toggle theme"
        >
          {darkMode ? (
            <>
              <SunIcon className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">Light Mode</span>
            </>
          ) : (
            <>
              <MoonIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">Dark Mode</span>
            </>
          )}
        </button>
        
        <div className="p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Employee Settings
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your preferences and profile</p>
          </div>

          <div className="flex flex-col items-center">
            {previewUrl ? (
              <div className="relative group">
                <img
                  src={previewUrl}
                  alt="Avatar"
                  className="h-24 w-24 rounded-full object-cover border-2 border-blue-500 shadow-lg transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  onClick={handleDeleteAvatar}
                  className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-gray-700 rounded-full shadow hover:bg-red-500 hover:text-white transition-all duration-200"
                  title="Remove Avatar"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="h-24 w-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-300 dark:to-blue-400 text-blue-600 rounded-full flex items-center justify-center text-3xl font-semibold shadow-inner border-2 border-blue-200 dark:border-blue-300">
                👤
              </div>
            )}
            <label className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors duration-200 shadow-sm">
              Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Change Password
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-3 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className={`w-full py-3 px-4 text-base rounded-lg font-medium text-white transition-all duration-200 shadow-md ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 极速4 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Changes...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSettingsPage;