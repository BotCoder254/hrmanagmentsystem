import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { format } from 'date-fns';
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
  Legend
);

const JobMetrics = ({ jobs = [], chartType = 'line' }) => {
  const metrics = useMemo(() => {
    return jobs.reduce((acc, job) => {
      // Count referrals properly from the referrals object
      const referralCount = Object.keys(job.referrals || {}).length;
      
      return {
        totalJobs: acc.totalJobs + 1,
        activeJobs: acc.activeJobs + (job.status === 'active' ? 1 : 0),
        totalReferrals: acc.totalReferrals + referralCount,
        byDepartment: {
          ...acc.byDepartment,
          [job.department]: (acc.byDepartment[job.department] || 0) + 1
        },
        byStatus: {
          ...acc.byStatus,
          [job.status]: (acc.byStatus[job.status] || 0) + 1
        },
        referralsByJob: {
          ...acc.referralsByJob,
          [job.title]: referralCount
        }
      };
    }, {
      totalJobs: 0,
      activeJobs: 0,
      totalReferrals: 0,
      byDepartment: {},
      byStatus: {},
      referralsByJob: {}
    });
  }, [jobs]);

  const getChartData = () => {
    switch (chartType) {
      case 'bar':
        return {
          labels: Object.keys(metrics.byDepartment),
          datasets: [{
            label: 'Jobs by Department',
            data: Object.values(metrics.byDepartment),
            backgroundColor: 'rgba(96, 181, 255, 0.5)',
            borderColor: '#60B5FF',
            borderWidth: 1
          }]
        };
      case 'pie':
        return {
          labels: Object.keys(metrics.byStatus),
          datasets: [{
            data: Object.values(metrics.byStatus),
            backgroundColor: [
              'rgba(96, 181, 255, 0.5)',
              'rgba(255, 145, 73, 0.5)',
              'rgba(160, 174, 192, 0.5)'
            ],
            borderColor: [
              '#60B5FF',
              '#FF9149',
              '#A0AEC0'
            ],
            borderWidth: 1
          }]
        };
      default:
        // Sort jobs by referral count for the line chart
        const sortedJobs = Object.entries(metrics.referralsByJob)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5);

        return {
          labels: sortedJobs.map(([title]) => title),
          datasets: [{
            label: 'Referrals per Job',
            data: sortedJobs.map(([, count]) => count),
            borderColor: '#60B5FF',
            backgroundColor: 'rgba(96, 181, 255, 0.5)',
            tension: 0.4
          }]
        };
    }
  };

  const renderChart = () => {
    const chartData = getChartData();
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: chartType === 'bar' ? 'Jobs by Department' :
                chartType === 'pie' ? 'Jobs by Status' :
                'Top Jobs by Referrals'
        }
      }
    };

    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      default:
        return <Line data={chartData} options={chartOptions} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900">Total Jobs</h3>
          <p className="text-3xl font-bold text-primary mt-2">{metrics.totalJobs}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900">Active Jobs</h3>
          <p className="text-3xl font-bold text-highlight mt-2">{metrics.activeJobs}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900">Total Referrals</h3>
          <p className="text-3xl font-bold text-secondary mt-2">{metrics.totalReferrals}</p>
        </motion.div>
      </div>

      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        {renderChart()}
      </motion.div>
    </motion.div>
  );
};

export default JobMetrics; 
