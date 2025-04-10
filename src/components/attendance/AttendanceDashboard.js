import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Line, Bar } from 'react-chartjs-2';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FaSearch, FaDownload, FaSpinner } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AttendanceDashboard = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAttendanceData();
  }, [dateRange, department]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const start = new Date(dateRange.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);

      const attendanceRef = collection(db, 'attendance');
      const q = query(attendanceRef);

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        checkInTime: doc.data().checkInTime?.toDate(),
        checkOutTime: doc.data().checkOutTime?.toDate()
      })).filter(record => {
        const recordDate = record.date;
        return recordDate >= start && recordDate <= end;
      });

      setAttendanceData(data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = attendanceData.filter(record => {
    const matchesDepartment = department === 'all' || record.department === department;
    const matchesSearch = record.employeeName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  const getChartData = () => {
    const departmentStats = {};
    const dailyStats = {};

    filteredData.forEach(record => {
      // Department stats
      if (!departmentStats[record.department]) {
        departmentStats[record.department] = {
          present: 0,
          partial: 0,
          absent: 0
        };
      }

      if (record.checkInTime && record.checkOutTime) {
        departmentStats[record.department].present++;
      } else if (record.checkInTime) {
        departmentStats[record.department].partial++;
      } else {
        departmentStats[record.department].absent++;
      }

      // Daily stats
      const dateStr = format(record.date, 'MMM d');
      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = {
          total: 0,
          present: 0,
          partial: 0
        };
      }
      dailyStats[dateStr].total++;
      if (record.checkInTime && record.checkOutTime) {
        dailyStats[dateStr].present++;
      } else if (record.checkInTime) {
        dailyStats[dateStr].partial++;
      }
    });

    return {
      departmentChart: {
        labels: Object.keys(departmentStats),
        datasets: [
          {
            label: 'Present',
            data: Object.values(departmentStats).map(stats => stats.present),
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
          },
          {
            label: 'Partial',
            data: Object.values(departmentStats).map(stats => stats.partial),
            backgroundColor: 'rgba(234, 179, 8, 0.5)',
          },
          {
            label: 'Absent',
            data: Object.values(departmentStats).map(stats => stats.absent),
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
          },
        ],
      },
      attendanceChart: {
        labels: Object.keys(dailyStats),
        datasets: [
          {
            label: 'Attendance Rate',
            data: Object.values(dailyStats).map(
              stats => ((stats.present + stats.partial * 0.5) / stats.total) * 100
            ),
            borderColor: 'rgb(96, 165, 250)',
            tension: 0.4,
          },
        ],
      },
    };
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Employee', 'Department', 'Check In', 'Check Out', 'Status'];
    const csvData = filteredData.map(record => [
      format(record.date, 'yyyy-MM-dd'),
      record.employeeName,
      record.department,
      record.checkInTime ? format(record.checkInTime, 'HH:mm:ss') : '-',
      record.checkOutTime ? format(record.checkOutTime, 'HH:mm:ss') : '-',
      record.checkInTime && record.checkOutTime ? 'Present' : record.checkInTime ? 'Partial' : 'Absent'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers, ...csvData].map(row => row.join(',')).join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `attendance_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Filters and Export */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Departments</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
          </select>

          <div className="flex gap-4">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportToCSV}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <FaDownload className="mr-2" />
          Export Report
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900">Total Records</h3>
          <p className="text-3xl font-bold text-primary mt-2">{filteredData.length}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900">Present</h3>
          <p className="text-3xl font-bold text-green-500 mt-2">
            {filteredData.filter(r => r.checkInTime && r.checkOutTime).length}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900">Partial</h3>
          <p className="text-3xl font-bold text-yellow-500 mt-2">
            {filteredData.filter(r => r.checkInTime && !r.checkOutTime).length}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900">Absent</h3>
          <p className="text-3xl font-bold text-red-500 mt-2">
            {filteredData.filter(r => !r.checkInTime).length}
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-medium mb-4">Department Attendance</h3>
          {!loading && <Bar data={getChartData().departmentChart} options={chartOptions} />}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-medium mb-4">Daily Attendance Rate</h3>
          {!loading && <Line data={getChartData().attendanceChart} options={chartOptions} />}
        </motion.div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <FaSpinner className="w-6 h-6 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                filteredData.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(record.date, 'yyyy-MM-dd')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.employeeName}
                      </div>
                      <div className="text-sm text-gray-500">{record.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkInTime ? format(record.checkInTime, 'HH:mm:ss') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkOutTime ? format(record.checkOutTime, 'HH:mm:ss') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.checkInTime && record.checkOutTime
                            ? 'bg-green-100 text-green-800'
                            : record.checkInTime
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.checkInTime && record.checkOutTime
                          ? 'Present'
                          : record.checkInTime
                          ? 'Partial'
                          : 'Absent'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard; 

