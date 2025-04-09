import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarCheck, FaChartLine, FaBullhorn, FaClock, FaSpinner } from 'react-icons/fa';
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

const Dashboard = () => {
  const { user } = useAuth();
  const {
    performance,
    announcements,
    attendance,
    loading,
    error
  } = useDashboardData(user?.uid, false);

  const getAttendanceRate = () => {
    if (!attendance) return '0%';
    const present = Object.values(attendance).filter(status => status === 'present').length;
    const total = Object.values(attendance).length;
    return total > 0 ? `${Math.round((present / total) * 100)}%` : '0%';
  };

  const getWeeklyHours = () => {
    if (!attendance) return '0';
    const thisWeek = Object.entries(attendance)
      .filter(([date]) => {
        const entryDate = new Date(date);
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return entryDate >= weekStart;
      })
      .filter(([_, status]) => status === 'present')
      .length * 8; // Assuming 8 hours per day
    return thisWeek.toString();
  };

  const getPerformanceScore = () => {
    if (!performance || performance.length === 0) return '0/100';
    const latestScore = performance[performance.length - 1].score;
    return `${latestScore}/100`;
  };

  const performanceData = {
    labels: performance?.map(p => format(new Date(p.date), 'MMM d')) || [],
    datasets: [
      {
        label: 'Performance Score',
        data: performance?.map(p => p.score) || [],
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
        text: 'Performance Trend',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
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
          <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your performance and stay updated with company announcements
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Attendance Rate"
            value={getAttendanceRate()}
            icon={FaCalendarCheck}
            color="primary"
          />
          <StatsCard
            title="Performance Score"
            value={getPerformanceScore()}
            icon={FaChartLine}
            color="highlight"
          />
          <StatsCard
            title="Announcements"
            value={announcements.length}
            icon={FaBullhorn}
            color="secondary"
          />
          <StatsCard
            title="Hours This Week"
            value={getWeeklyHours()}
            icon={FaClock}
            color="accent"
          />
        </div>

        {/* Charts and Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <Line data={performanceData} options={chartOptions} />
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

export default Dashboard; 