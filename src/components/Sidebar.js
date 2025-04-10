import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  FaChartLine,
  FaBriefcase,
  FaHome,
  FaFileAlt,
  FaAngleLeft,
  FaAngleRight,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logOut } = useAuth();

  const employeeLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: FaHome },
    { name: 'Announcements', path: '/dashboard/announcements', icon: FaBullhorn },
    { name: 'Leaves', path: '/dashboard/leaves', icon: FaCalendarAlt },
    { name: 'Performance', path: '/dashboard/performance', icon: FaChartLine },
    { name: 'Jobs', path: '/dashboard/jobs', icon: FaBriefcase },
    { name: 'Documents', path: '/dashboard/documents', icon: FaFileAlt },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: FaHome },
    { name: 'Employees', path: '/admin/employees', icon: FaUsers },
    { name: 'Announcements', path: '/admin/announcements', icon: FaBullhorn },
    { name: 'Leaves', path: '/admin/leaves', icon: FaCalendarAlt },
    { name: 'Performance', path: '/admin/performance', icon: FaChartLine },
    { name: 'Jobs', path: '/admin/jobs', icon: FaBriefcase },
    { name: 'Documents', path: '/admin/documents', icon: FaFileAlt },
  ];

  const menuItems = [
    // Common items for both roles
    {
      path: user?.role === 'admin' ? '/admin' : '/dashboard',
      icon: <FaChartBar />,
      label: 'Dashboard',
    },
    {
      path: user?.role === 'admin' ? '/admin/employees' : '/dashboard/profile',
      icon: user?.role === 'admin' ? <FaUsers /> : <FaUserCog />,
      label: user?.role === 'admin' ? 'Employees' : 'My Profile',
      adminOnly: user?.role === 'admin',
    },
    {
      path: `${user?.role === 'admin' ? '/admin' : '/dashboard'}/announcements`,
      icon: <FaBullhorn />,
      label: 'Announcements',
    },
    {
      path: `${user?.role === 'admin' ? '/admin' : '/dashboard'}/leaves`,
      icon: <FaCalendarCheck />,
      label: 'Leave Requests',
    },
    {
      path: `${user?.role === 'admin' ? '/admin' : '/dashboard'}/performance`,
      icon: <FaChartLine />,
      label: 'Performance',
    },
    {
      path: `${user?.role === 'admin' ? '/admin' : '/dashboard'}/jobs`,
      icon: <FaBriefcase />,
      label: 'Jobs',
    },
    {
      path: `${user?.role === 'admin' ? '/admin' : '/dashboard'}/documents`,
      icon: <FaFileAlt />,
      label: 'Documents',
    },
    // Admin-only items
    {
      path: '/admin/settings',
      icon: <FaCog />,
      label: 'Settings',
      adminOnly: true,
    },
  ];

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const filteredMenuItems = menuItems.filter(
    item => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <motion.div
      initial={{ width: 240 }}
      animate={{ width: isCollapsed ? 80 : 240 }}
      className="h-full bg-white border-r border-gray-200 flex flex-col shadow-sm"
      style={{ minWidth: isCollapsed ? 80 : 240 }}
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
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => (
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