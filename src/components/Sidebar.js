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
  FaClock,
  FaCalendarDay,
  FaMoneyBillWave,
  FaTasks,
  FaGraduationCap
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logOut } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const menuItems = isAdmin ? [
    { path: '/admin', icon: FaHome, label: 'Dashboard' },
    { path: '/admin/employees', icon: FaUsers, label: 'Employees' },
    { path: '/admin/announcements', icon: FaBullhorn, label: 'Announcements' },
    { path: '/admin/attendance', icon: FaCalendarAlt, label: 'Attendance' },
    { path: '/admin/leaves', icon: FaFileAlt, label: 'Leave Requests' },
    { path: '/admin/payroll', icon: FaMoneyBillWave, label: 'Payroll' },
    { path: '/admin/tasks', icon: FaTasks, label: 'Tasks' },
    { path: '/admin/training', icon: FaGraduationCap, label: 'Training' },
    { path: '/admin/shifts', icon: FaClock, label: 'Shifts' },
    { path: '/admin/jobs', icon: FaBriefcase, label: 'Jobs' },
    { path: '/admin/documents', icon: FaFileAlt, label: 'Documents' }
  ] : [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/profile', icon: FaUserCircle, label: 'Profile' },
    { path: '/announcements', icon: FaBullhorn, label: 'Announcements' },
    { path: '/attendance', icon: FaCalendarAlt, label: 'Attendance' },
    { path: '/leaves', icon: FaFileAlt, label: 'Leave Requests' },
    { path: '/payroll', icon: FaMoneyBillWave, label: 'Payroll' },
    { path: '/tasks', icon: FaTasks, label: 'Tasks' },
    { path: '/training', icon: FaGraduationCap, label: 'Training' },
    { path: '/shifts', icon: FaClock, label: 'Shifts' },
    { path: '/jobs', icon: FaBriefcase, label: 'Jobs' },
    { path: '/documents', icon: FaFileAlt, label: 'Documents' }
  ];

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
          {menuItems.map(({ path, icon: Icon, label }) => (
            <li key={path}>
              <Link
                to={path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  location.pathname === path
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="text-xl" />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {label}
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
              Logout
            </motion.span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;