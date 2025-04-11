import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  FaFileDownload,
  FaSpinner,
  FaChartLine,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaPercentage
} from 'react-icons/fa';

const SalaryHistory = () => {
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [viewMode, setViewMode] = useState('table');
  const [stats, setStats] = useState({
    totalEarned: 0,
    averageSalary: 0,
    highestSalary: 0,
    lowestSalary: 0,
    yearlyTrend: [],
    bonusTotal: 0,
    deductionsTotal: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;
    
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'payroll'),
        where('employeeId', '==', user.uid)
      ),
      (snapshot) => {
        const history = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().createdAt)
        }));

        // Sort by date
        history.sort((a, b) => b.timestamp - a.timestamp);
        
        setSalaryHistory(history);
        setStats(calculateStats(history));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const calculateStats = (history) => {
    const yearlyData = history.filter(item => 
      new Date(item.timestamp).getFullYear().toString() === selectedYear
    );

    const totalEarned = yearlyData.reduce((sum, item) => sum + item.netSalary, 0);
    const salaries = yearlyData.map(item => item.netSalary);
    const bonusTotal = yearlyData.reduce((sum, item) => sum + (item.bonus || 0), 0);
    const deductionsTotal = yearlyData.reduce((sum, item) => sum + (item.deductions || 0), 0);

    // Calculate monthly trends
    const monthlyTrends = Array.from({ length: 12 }, (_, month) => {
      const monthData = yearlyData.filter(item => 
        new Date(item.timestamp).getMonth() === month
      );
      return {
        month: format(new Date(selectedYear, month), 'MMM'),
        salary: monthData[0]?.netSalary || 0
      };
    });

    return {
      totalEarned,
      averageSalary: salaries.length ? totalEarned / salaries.length : 0,
      highestSalary: Math.max(...salaries, 0),
      lowestSalary: Math.min(...(salaries.length ? salaries : [0])),
      yearlyTrend: monthlyTrends,
      bonusTotal,
      deductionsTotal
    };
  };

  const getChartData = () => {
    return {
      labels: stats.yearlyTrend.map(item => item.month),
      datasets: [
        {
          label: 'Monthly Salary',
          data: stats.yearlyTrend.map(item => item.salary),
          borderColor: '#60B5FF',
          backgroundColor: 'rgba(96, 181, 255, 0.5)',
          tension: 0.4
        }
      ]
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Earned ({selectedYear})</p>
              <p className="text-2xl font-bold text-primary mt-2">
                {formatCurrency(stats.totalEarned)}
              </p>
            </div>
            <FaMoneyBillWave className="w-8 h-8 text-primary/20" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Salary</p>
              <p className="text-2xl font-bold text-highlight mt-2">
                {formatCurrency(stats.averageSalary)}
              </p>
            </div>
            <FaChartLine className="w-8 h-8 text-highlight/20" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bonus</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(stats.bonusTotal)}
              </p>
            </div>
            <FaPercentage className="w-8 h-8 text-green-600/20" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Deductions</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {formatCurrency(stats.deductionsTotal)}
              </p>
            </div>
            <FaPercentage className="w-8 h-8 text-red-600/20" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {Array.from(
              { length: 5 },
              (_, i) => new Date().getFullYear() - i
            ).map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="table">Table View</option>
            <option value="chart">Chart View</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bonus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salaryHistory
                .filter(slip => new Date(slip.timestamp).getFullYear().toString() === selectedYear)
                .map((slip) => (
                  <motion.tr
                    key={slip.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(slip.timestamp), 'MMMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(slip.baseSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      +{formatCurrency(slip.bonus || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      -{formatCurrency(slip.deductions || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      {formatCurrency(slip.netSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => window.open(slip.slipUrl, '_blank')}
                        className="text-primary hover:text-primary/80"
                        title="Download Slip"
                      >
                        <FaFileDownload className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Trend</h3>
          <Line
            data={getChartData()}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: `Monthly Salary Trend - ${selectedYear}`
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => formatCurrency(value)
                  }
                }
              }
            }}
          />
        </motion.div>
      )}
    </div>
  );
};

export default SalaryHistory; 

 