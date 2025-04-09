import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaChartBar, 
  FaUsers, 
  FaCalendarAlt, 
  FaClipboardList,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaChevronLeft,
  FaUserCircle,
  FaUserCog,
  FaBullhorn,
  FaCalendarCheck,
  FaChartLine
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, logOut } = useAuth();

  const adminMenuItems = [
    { path: '/admin', icon: <FaChartBar />, label: 'Dashboard' },
    { path: '/admin/employees', icon: <FaUsers />, label: 'Employees' },
    { path: '/admin/announcements', icon: <FaBullhorn />, label: 'Announcements' },
    { path: '/admin/leaves', icon: <FaCalendarCheck />, label: 'Leave Requests' },
    { path: '/admin/performance', icon: <FaChartLine />, label: 'Performance' },
    { path: '/admin/settings', icon: <FaCog />, label: 'Settings' },
  ];

  const employeeMenuItems = [
    { path: '/dashboard', icon: <FaChartBar />, label: 'Dashboard' },
    { path: '/dashboard/profile', icon: <FaUserCog />, label: 'My Profile' },
    { path: '/dashboard/announcements', icon: <FaBullhorn />, label: 'Announcements' },
    { path: '/dashboard/leaves', icon: <FaCalendarCheck />, label: 'Leave Requests' },
    { path: '/dashboard/performance', icon: <FaChartLine />, label: 'Performance' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : employeeMenuItems;

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <motion.div
      initial={{ width: 240 }}
      animate={{ width: isCollapsed ? 80 : 240 }}
      className="min-h-screen bg-white border-r border-gray-200 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!isCollapsed && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-gray-800"
          >
            HR System
          </motion.h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? <FaBars /> : <FaChevronLeft />}
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <FaUserCircle className="text-3xl text-gray-400" />
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="font-medium text-gray-800">{user?.email}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <FaSignOutAlt className="text-xl" />
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Sign Out
            </motion.span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar; 