import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0">
        <Sidebar />
      </div>

      {/* Main Content - Scrollable */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-auto ml-[240px]"
      >
        <div className="container mx-auto px-6 py-8">
          {/* User Info Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Welcome, {user?.email?.split('@')[0]}
                </h2>
                <p className="text-gray-600 mt-1">
                  {user?.role === 'admin' ? 'Administrator' : 'Employee'} Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {children}
        </div>
      </motion.main>
    </div>
  );
};

export default DashboardLayout; 