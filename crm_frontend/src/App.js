import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
// Common
import Login from './login';
// Admin
import AdminDashboard from './components/admin/AdminDashboard';
import LeaveRequests from './components/admin/LeaveRequests';
import AdminLayout from './components/admin/AdminLayout';
import AdminChangeRequests from './components/admin/AdminChangeRequests';
import Resetpass from './pages/Resetpass';
import ForgotPass from './pages/ForgotPass';

// Employee
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeDetail from './pages/EmployeeDetail';
import EmployeeForm from './pages/EmployeeForm';
import EmployeeSettingsPage from './pages/EmployeeSettingsPage';
import ProjectsPage from './components/ProjectsPage';
import ProfilePage from './pages/ProfilePage';
import AttendanceDashboard from './components/AttendanceDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import LeaveDashboard from './pages/LeaveDashboard';
import LeaveDetail from './pages/LeaveDetail';
import Layout from './components/EmployeeLayout';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';


// Create a context for dark mode
export const DarkModeContext = React.createContext();

const FadeWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.25 }}
    className="h-full"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Shared Login */}
        <Route path="/" element={<FadeWrapper><Login /></FadeWrapper>} />
        <Route path="/employees/login" element={<FadeWrapper><EmployeeLogin /></FadeWrapper>} />
        <Route path="/reset-password" element={<FadeWrapper><ResetPassword /></FadeWrapper>} />
        <Route path="/forgot-password" element={<FadeWrapper><ForgotPassword /></FadeWrapper>} />
        <Route path="/reset-password" element={<FadeWrapper><Resetpass /></FadeWrapper>} />
        <Route path="/forgot-password" element={<FadeWrapper><ForgotPass /></FadeWrapper>} />
        {/* Employee Side */}
        <Route element={<Layout />}>
          <Route path="/employees" element={<FadeWrapper><EmployeesPage /></FadeWrapper>} />
          <Route path="/employees/add" element={<FadeWrapper><EmployeeForm /></FadeWrapper>} />
          <Route path="/employees/edit/:id" element={<FadeWrapper><EmployeeForm /></FadeWrapper>} />
          <Route path="/employees/:id" element={<FadeWrapper><EmployeeDetail /></FadeWrapper>} />
          <Route path="/employees/profile/:employeeId" element={<FadeWrapper><ProfilePage /></FadeWrapper>} />
          <Route path="/employees/employees/:employeeId" element={<FadeWrapper><EmployeeDashboard /></FadeWrapper>} />
          <Route path="/settings" element={<FadeWrapper><EmployeeSettingsPage /></FadeWrapper>} />
          <Route path="/projects" element={<FadeWrapper><ProjectsPage /></FadeWrapper>} />
          <Route path="/attendance" element={<FadeWrapper><AttendanceDashboard /></FadeWrapper>} />
          <Route path="/leave" element={<FadeWrapper><LeaveDashboard /></FadeWrapper>} />
          <Route path="/leave/detail/:leaveId" element={<FadeWrapper><LeaveDetail /></FadeWrapper>} />
        </Route>
        {/* Admin Side */}
        <Route element={<FadeWrapper><AdminLayout /></FadeWrapper>}>
          <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
          <Route path="/admin/leave-requests" element={<LeaveRequests />} />
          <Route path="/admin/change-requests" element={<AdminChangeRequests />} />
        </Route>
        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    // Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Router>
          <AnimatedRoutes />
        </Router>
      </div>
    </DarkModeContext.Provider>
  );
}

export default App;