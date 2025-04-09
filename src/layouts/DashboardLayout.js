import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-auto"
      >
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </motion.main>
    </div>
  );
};

export default DashboardLayout; 