import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
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
} from 'chart.js';
import { FaSearch, FaFileExport, FaSpinner } from 'react-icons/fa';
import { db } from '../../config/firebase';

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

const AttendanceDashboard = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        let date = docData.date;
        
        // Handle different date formats
        if (typeof date === 'string') {
          date = new Date(date);
        } else if (date?.toDate instanceof Function) {
          date = date.toDate();
        } else if (!(date instanceof Date)) {
          date = new Date();
        }

        return {
          id: doc.id,
          ...docData,
          date: date,
          checkInTime: docData.checkInTime?.toDate?.() || null,
          checkOutTime: docData.checkOutTime?.toDate?.() || null
        };
      });

      setAttendanceData(data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const getChartData = () => {
    const departmentData = {};
    const dailyAttendance = {};
    const statusStats = {
      present: 0,
      partial: 0,
      absent: 0
    };

    attendanceData.forEach(record => {
      // Department stats
      if (record.department) {
        departmentData[record.department] = (departmentData[record.department] || 0) + 1;
      }

      // Daily attendance
      const dateKey = format(record.date, 'yyyy-MM-dd');
      dailyAttendance[dateKey] = (dailyAttendance[dateKey] || 0) + 1;

      // Status stats
      if (record.checkInTime && record.checkOutTime) {
        statusStats.present++;
      } else if (record.checkInTime || record.checkOutTime) {
        statusStats.partial++;
      } else {
        statusStats.absent++;
      }
    });

    return {
      departmentChart: {
        labels: Object.keys(departmentData),
        datasets: [{
          label: 'Attendance by Department',
          data: Object.values(departmentData),
          backgroundColor: 'rgba(96, 181, 255, 0.5)',
          borderColor: '#60B5FF',
          borderWidth: 1
        }]
      },
      attendanceChart: {
        labels: Object.keys(dailyAttendance).slice(-7),
        datasets: [{
          label: 'Daily Attendance Rate',
          data: Object.values(dailyAttendance).slice(-7),
          borderColor: '#FF9149',
          backgroundColor: 'rgba(255, 145, 73, 0.5)',
          tension: 0.4
        }]
      },
      statusChart: {
        labels: ['Present', 'Partial', 'Absent'],
        datasets: [{
          data: [statusStats.present, statusStats.partial, statusStats.absent],
          backgroundColor: [
            'rgba(96, 181, 255, 0.5)',
            'rgba(255, 145, 73, 0.5)',
            'rgba(239, 68, 68, 0.5)'
          ],
          borderColor: [
            '#60B5FF',
            '#FF9149',
            '#EF4444'
          ],
          borderWidth: 1
        }]
      }
    };
  };

  const exportToCSV = () => {
    const headers = ['Employee', 'Department', 'Date', 'Time In', 'Time Out', 'Status'];
    const csvData = attendanceData.map(record => [
      record.employeeName,
      record.department,
      format(record.date, 'yyyy-MM-dd'),
      record.checkInTime ? format(record.checkInTime, 'HH:mm:ss') : 'N/A',
      record.checkOutTime ? format(record.checkOutTime, 'HH:mm:ss') : 'N/A',
      record.checkInTime && record.checkOutTime ? 'Present' : record.checkInTime ? 'Partial' : 'Absent'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        {error}
        <button
          onClick={fetchAttendanceData}
          className="block mx-auto mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Departments</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <FaFileExport />
            Export Report
          </motion.button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-sm font-medium text-gray-500">Present Rate</h3>
          <p className="text-2xl font-bold text-primary mt-2">
            {Math.round((chartData.statusChart.datasets[0].data[0] / attendanceData.length) * 100)}%
          </p>
        </motion.div>
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-sm font-medium text-gray-500">Absent Rate</h3>
          <p className="text-2xl font-bold text-red-500 mt-2">
            {Math.round((chartData.statusChart.datasets[0].data[2] / attendanceData.length) * 100)}%
          </p>
        </motion.div>
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-sm font-medium text-gray-500">Total Employees</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {new Set(attendanceData.map(record => record.employeeId)).size}
          </p>
        </motion.div>
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-sm font-medium text-gray-500">Departments</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {new Set(attendanceData.map(record => record.department)).size}
          </p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4">Department Attendance</h3>
          <Bar data={chartData.departmentChart} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4">Daily Attendance Rate</h3>
          <Line data={chartData.attendanceChart} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2"
        >
          <h3 className="text-lg font-semibold mb-4">Attendance Status Distribution</h3>
          <div className="max-w-md mx-auto">
            <Pie data={chartData.statusChart} />
          </div>
        </motion.div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData
                .filter(record => {
                  if (selectedDepartment !== 'all' && record.department !== selectedDepartment) {
                    return false;
                  }
                  if (searchQuery && !record.employeeName?.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                  }
                  return true;
                })
                .map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                      <div className="text-sm text-gray-500">{record.employeeEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(record.date, 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkInTime ? format(record.checkInTime, 'hh:mm a') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkOutTime ? format(record.checkOutTime, 'hh:mm a') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.checkInTime && record.checkOutTime
                          ? 'bg-green-100 text-green-800'
                          : record.checkInTime
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.checkInTime && record.checkOutTime
                          ? 'Present'
                          : record.checkInTime
                          ? 'Partial'
                          : 'Absent'}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;

