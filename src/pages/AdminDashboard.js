import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaBuilding, FaChartLine, FaBullhorn, FaSpinner } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format } from 'date-fns';
import DashboardLayout from '../layouts/DashboardLayout';
import StatsCard from '../components/dashboard/StatsCard';
import { useAuth } from '../context/AuthContext';
import useDashboardData from '../hooks/useDashboardData';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const { 
    employeeCount, 
    departmentStats, 
    announcements, 
    loading, 
    error 
  } = useDashboardData(user?.uid, true);

  const departmentChartData = {
    labels: Object.keys(departmentStats),
    datasets: [
      {
        label: 'Employees per Department',
        data: Object.values(departmentStats),
        backgroundColor: 'rgba(96, 181, 255, 0.5)',
        borderColor: '#60B5FF',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Department Distribution',
      },
    },
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center space-y-4"
          >
            <FaSpinner className="w-8 h-8 text-primary animate-spin" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your organization's metrics and performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Employees"
            value={employeeCount}
            icon={FaUsers}
            color="primary"
          />
          <StatsCard
            title="Departments"
            value={Object.keys(departmentStats).length}
            icon={FaBuilding}
            color="secondary"
          />
          <StatsCard
            title="Active Projects"
            value={Object.values(departmentStats).reduce((sum, count) => sum + count, 0)}
            icon={FaChartLine}
            color="highlight"
          />
          <StatsCard
            title="Announcements"
            value={announcements.length}
            icon={FaBullhorn}
            color="accent"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <Line data={departmentChartData} options={chartOptions} />
          </motion.div>

          {/* Recent Announcements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-4">Recent Announcements</h3>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="border-b border-gray-100 pb-4 last:border-0"
                >
                  <h4 className="font-medium text-gray-800">
                    {announcement.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {format(announcement.timestamp, 'MMM d, yyyy')}
                  </p>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No announcements available
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard; 