import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LeaveAnalytics = ({ requests }) => {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    byDepartment: {},
    byType: {},
    monthlyTrends: {},
  });

  useEffect(() => {
    if (!requests) return;

    const now = new Date();
    const last6Months = new Array(6).fill(0).map((_, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      return d.toLocaleString('default', { month: 'short' });
    }).reverse();

    const monthlyData = {};
    last6Months.forEach(month => {
      monthlyData[month] = { total: 0, approved: 0, rejected: 0, pending: 0 };
    });

    const departmentStats = {};
    const typeStats = {};

    let totalPending = 0;
    let totalApproved = 0;
    let totalRejected = 0;

    requests.forEach(request => {
      // Status counts
      if (request.status === 'pending') totalPending++;
      if (request.status === 'approved') totalApproved++;
      if (request.status === 'rejected') totalRejected++;

      // Department stats
      const dept = request.department || 'Unassigned';
      departmentStats[dept] = (departmentStats[dept] || 0) + 1;

      // Leave type stats
      const type = request.type || 'Other';
      typeStats[type] = (typeStats[type] || 0) + 1;

      // Monthly trends
      const requestMonth = new Date(request.startDate).toLocaleString('default', { month: 'short' });
      if (monthlyData[requestMonth]) {
        monthlyData[requestMonth].total++;
        monthlyData[requestMonth][request.status]++;
      }
    });

    setStats({
      totalRequests: requests.length,
      pending: totalPending,
      approved: totalApproved,
      rejected: totalRejected,
      byDepartment: departmentStats,
      byType: typeStats,
      monthlyTrends: monthlyData,
    });
  }, [requests]);

  const monthlyTrendsData = {
    labels: Object.keys(stats.monthlyTrends),
    datasets: [
      {
        label: 'Total Requests',
        data: Object.values(stats.monthlyTrends).map(m => m.total),
        borderColor: '#60B5FF',
        backgroundColor: 'rgba(96, 181, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Approved',
        data: Object.values(stats.monthlyTrends).map(m => m.approved),
        borderColor: '#34D399',
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const departmentData = {
    labels: Object.keys(stats.byDepartment),
    datasets: [{
      data: Object.values(stats.byDepartment),
      backgroundColor: [
        '#60B5FF',
        '#34D399',
        '#F87171',
        '#FBBF24',
        '#818CF8',
        '#EC4899',
      ],
    }],
  };

  const statusData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [{
      data: [stats.pending, stats.approved, stats.rejected],
      backgroundColor: ['#FBBF24', '#34D399', '#F87171'],
    }],
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4">Leave Requests Status</h3>
          <div className="aspect-square">
            <Pie 
              data={statusData}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm md:col-span-2"
        >
          <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
          <Line 
            data={monthlyTrendsData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }}
          />
        </motion.div>
      </div>

      {/* Department Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
        <Bar
          data={{
            labels: Object.keys(stats.byDepartment),
            datasets: [{
              label: 'Leave Requests',
              data: Object.values(stats.byDepartment),
              backgroundColor: '#60B5FF',
            }],
          }}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
            },
          }}
        />
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h4 className="text-sm font-medium text-gray-500">Total Requests</h4>
          <p className="text-2xl font-bold mt-2">{stats.totalRequests}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h4 className="text-sm font-medium text-gray-500">Pending</h4>
          <p className="text-2xl font-bold mt-2 text-yellow-500">{stats.pending}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h4 className="text-sm font-medium text-gray-500">Approved</h4>
          <p className="text-2xl font-bold mt-2 text-green-500">{stats.approved}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h4 className="text-sm font-medium text-gray-500">Rejected</h4>
          <p className="text-2xl font-bold mt-2 text-red-500">{stats.rejected}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default LeaveAnalytics; 