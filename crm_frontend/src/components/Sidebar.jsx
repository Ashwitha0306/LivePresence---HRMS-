import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiUser,
  FiBriefcase,
  FiCalendar,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiMessageSquare,
  FiUsers,
  FiFileText,
  FiChevronRight,
  FiAlertTriangle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import useTheme from '../hooks/useTheme'; // Import your theme hook
  const employeeId = localStorage.getItem('employeeId');
const employeeNavItems = [
  { to: employeeId ? `/employees/employees/${employeeId}` : '/employees/login', 
    icon: <FiHome />, 
    label: 'Home',
    id: 'home' },
  { to: employeeId ? `/employees/profile/${employeeId}` : '/employees/login', 
    icon: <FiUser />, 
    label: 'Profile',
    id: 'profile' },
  { to: '/projects', icon: <FiBriefcase />, label: 'Tasks', id: 'tasks' },
  { to: '/attendance', icon: <FiCalendar />, label: 'Attendance', id: 'attendance' },
  { to: '/leave', icon: <FiFileText />, label: 'Leave', id: 'leave' },
  { to: '/settings', icon: <FiSettings />, label: 'Settings', id: 'settings' },
];


const EmployeeSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('employeeSidebarCollapsed') === 'true';
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [activeHover, setActiveHover] = useState(null);


  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeRefreshToken');
    navigate('/employees/login');
  };

  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('employeeSidebarCollapsed', newState);
      return newState;
    });
    setIsHovering(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    clearTimeout(hoverTimeout);
    setIsHovering(true);
  }, [hoverTimeout]);

  const handleMouseLeave = useCallback(() => {
    const timeout = setTimeout(() => {
      setIsHovering(false);
    }, 200);
    setHoverTimeout(timeout);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  return (
    <>
      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 50 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.6 }}
                    >
                      <FiAlertTriangle className="text-yellow-500 mr-3" size={24} />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Confirm Logout</h3>
                  </div>
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-600 dark:text-gray-300 mb-6"
                >
                  Are you sure you want to logout from your employee account?
                </motion.p>
                <div className="flex justify-end gap-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowLogoutModal(false)}
                    className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLogout}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center shadow-md transition-colors"
                  >
                    <FiLogOut className="mr-2" />
                    Logout
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Trigger Zone */}
      {collapsed && (
        <div 
          className="fixed top-0 left-0 h-full w-12 z-30 transition-opacity duration-200"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ width: collapsed ? 80 : 20 }}
        animate={{ 
          width: isHovering && collapsed ? 240 : collapsed ? 80 : 20,
          boxShadow: isHovering ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : 'none',
          backdropFilter: !collapsed || isHovering ? 'blur(12px)' : 'blur(6px)'
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`fixed top-0 left-0 h-full z-40 border-r border-gray-200/50 dark:border-gray-800/50
        ${collapsed ? 'bg-white/80 dark:bg-gray-900/80' : 'bg-white/50 dark:bg-gray-900/50'}
        text-gray-800 dark:text-gray-200 p-4 flex flex-col justify-between
        overflow-hidden`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div>
          {/* Header with Toggle */}
          <motion.div 
            layout
            className="flex justify-end mb-6"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={collapsed ? 'Expand' : 'Collapse'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <FiMenu size={18} /> : <FiX size={18} />}
            </motion.button>
          </motion.div>

          {/* Logo */}
          <motion.div 
            layout
            className={`flex items-center justify-center mb-6 p-2 rounded-lg ${
              !collapsed || isHovering ? 'bg-gray-100/30 dark:bg-gray-800/30' : ''
            } transition-colors duration-300`}
          >
            <motion.div 
              className="flex flex-col items-center"
              animate={{
                scale: collapsed && !isHovering ? 0.9 : 1
              }}
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-10 h-10 rounded-lg flex items-center justify-center shadow mb-2">
                <FiUser size={20} className="text-white" />
              </div>
              <motion.span
                animate={{ 
                  opacity: !collapsed || isHovering ? 1 : 0,
                  height: !collapsed || isHovering ? 'auto' : 0
                }}
                transition={{ duration: 0.15 }} 
                className="font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent whitespace-nowrap"
              >
                Employee Portal
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Navigation */}
          <nav className="space-y-1">
            {employeeNavItems.map(({ to, label, icon, end }) => (
              <motion.div
                key={to}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                layout
                onHoverStart={() => setActiveHover(to)}
                onHoverEnd={() => setActiveHover(null)}
                transition={{ duration: 0.15 }} 
              >
                <NavLink
               
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative
                    ${collapsed && !isHovering ? 'justify-center px-0' : 'justify-between'}
                    ${
                      isActive
                        ? 'bg-blue-50/70 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-600 hover:bg-gray-100/30 dark:text-gray-400 dark:hover:bg-gray-800/30'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center">
                        <motion.span
                          animate={{
                            color: isActive ? '#2563eb' : '#6b7280',
                            scale: activeHover === to ? 1.1 : 1
                          }}
                          transition={{ duration: 0.15 }} 
                          className={`flex ${collapsed && !isHovering ? 'justify-center w-full' : ''}`}
                        >
                          {React.cloneElement(icon, { size: 18 })}
                        </motion.span>
                        <motion.span 
                          animate={{ 
                            opacity: !collapsed || isHovering ? 1 : 0,
                            x: !collapsed || isHovering ? 0 : -10
                          }}
                          transition={{ duration: 0.15 }}
                          className={`ml-2 whitespace-nowrap overflow-hidden ${collapsed && !isHovering ? 'hidden' : 'block'}`}
                        >
                          {label}
                        </motion.span>
                      </div>
                      {(!collapsed || isHovering) && isActive && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.15 }}
                          className={collapsed && !isHovering ? 'hidden' : 'block'}
                        >
                          <FiChevronRight size={14} className="text-blue-400" />
                        </motion.span>
                      )}
                    </>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </nav>
        </div>

        {/* Footer Section */}
        <div className="p-3 space-y-2">
          {/* Logout Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLogoutModal(true)}
            className={`flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer
            ${collapsed && !isHovering ? 'justify-center px-0' : 'justify-start'}
            bg-gradient-to-r from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20
            text-blue-500 dark:text-blue-400 relative overflow-hidden`}
            title={collapsed && !isHovering ? "Logout" : ""}
            transition={{ duration: 0.15 }} 
          >
            <motion.div 
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 0.1 }}
              className="absolute inset-0 bg-blue-500"
            />
            
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                transition: { repeat: Infinity, duration: 2 }
              }}
              className={`relative ${collapsed && !isHovering ? 'mx-auto' : 'mr-1.5'}`}
            >
              <FiLogOut size={16} />
            </motion.div>
            
            <motion.span
              animate={{ 
                opacity: !collapsed || isHovering ? 1 : 0,
                x: !collapsed || isHovering ? 0 : -10
              }}
              transition={{ duration: 0.15 }} 
              className={`whitespace-nowrap overflow-hidden ${collapsed && !isHovering ? 'hidden' : 'block'}`}
            >
              Logout
            </motion.span>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
};

export default EmployeeSidebar;