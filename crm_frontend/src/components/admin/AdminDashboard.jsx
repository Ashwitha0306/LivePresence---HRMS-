import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../../components/admin/AdminSidebar';
import RolePermissions from './RolePermissions'; // Adjust path if needed
import DashboardPanel from '../../components/admin/DashboardPanel';
import UserManagement from '../../components/admin/UserManagement';
import TaskManager from '../../components/admin/TaskManager';
import AttendancePanel from '../../components/admin/AttendancePanel';
import LeaveRequests from '../../components/admin/LeaveRequests';
import ActivityLogs from '../../components/admin/ActivityLogs';
import FileManager from '../../components/admin/FileManager';
import SettingsPanel from '../../components/admin/SettingsPanel';
import ReportManager from '../../components/admin/ReportManager';

const AdminDashboard = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">

      
      {/* Main Content Area */}
      <div className="flex-1 ml-20 transition-all duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route index element={<DashboardPanel />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="tasks" element={<TaskManager />} />
              <Route path="attendance" element={<AttendancePanel />} />
              <Route path="roles" element={<RolePermissions />} />
              <Route path="leaves" element={<LeaveRequests />} />
              <Route path="logs" element={<ActivityLogs />} />
              <Route path="files" element={<FileManager />} />
              <Route path="reports" element={<ReportManager />} />
              <Route path="settings" element={<SettingsPanel />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;