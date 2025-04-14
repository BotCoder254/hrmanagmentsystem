import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { 
  FaSearch, FaFileDownload, FaSpinner, FaPlus, FaUsers, 
  FaMoneyBillWave, FaChartLine, FaFilter, FaCalendar,
  FaFileInvoiceDollar, FaUserTie
} from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import PayrollForm from './PayrollForm';
import SalarySlip from './SalarySlip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { formatCurrency, formatMonth } from '../../utils/format';

const PayrollDashboard = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [viewMode, setViewMode] = useState('table');
  const [stats, setStats] = useState({
    totalPayroll: 0,
    averageSalary: 0,
    totalEmployees: 0,
    departmentTotals: {},
    monthlyTrends: [],
    salaryRanges: {
      '0-1000': 0,
      '1001-2000': 0,
      '2001-3000': 0,
      '3001-4000': 0,
      '4001+': 0
    }
  });
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [showSlip, setShowSlip] = useState(false);

  useEffect(() => {
    fetchDepartments();
    const unsubscribe = subscribeToPayrolls();
    return () => unsubscribe();
  }, [selectedDepartment, filterMonth]);

  const subscribeToPayrolls = () => {
    let q = collection(db, 'payroll');

    if (selectedDepartment !== 'all') {
      q = query(q, where('department', '==', selectedDepartment));
    }

    if (filterMonth) {
      q = query(q, where('month', '==', filterMonth));
    }

    return onSnapshot(q, (snapshot) => {
      const payrollData = snapshot.docs.map(doc => ({
          id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      setPayrolls(payrollData);
      setStats(calculateStats(payrollData));
      setLoading(false);
    });
  };

  const fetchDepartments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'departments'));
      const departmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const calculateStats = (payrollData) => {
    const total = payrollData.reduce((sum, p) => sum + p.netSalary, 0);
    const avg = payrollData.length ? total / payrollData.length : 0;
    
    // Calculate department totals
    const deptTotals = payrollData.reduce((acc, p) => {
      acc[p.department] = (acc[p.department] || 0) + p.netSalary;
      return acc;
    }, {});

    // Calculate monthly trends
    const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(new Date().getFullYear(), i);
      const monthPayrolls = payrollData.filter(p => 
        p.timestamp?.getMonth() === month.getMonth() &&
        p.timestamp?.getFullYear() === month.getFullYear()
      );
      return {
        month: format(month, 'MMM'),
        total: monthPayrolls.reduce((sum, p) => sum + p.netSalary, 0)
      };
    });

    // Calculate salary ranges
    const salaryRanges = payrollData.reduce((acc, p) => {
      if (p.netSalary <= 1000) acc['0-1000']++;
      else if (p.netSalary <= 2000) acc['1001-2000']++;
      else if (p.netSalary <= 3000) acc['2001-3000']++;
      else if (p.netSalary <= 4000) acc['3001-4000']++;
      else acc['4001+']++;
      return acc;
    }, {
      '0-1000': 0,
      '1001-2000': 0,
      '2001-3000': 0,
      '3001-4000': 0,
      '4001+': 0
    });

    return {
      totalPayroll: total,
      averageSalary: avg,
      totalEmployees: payrollData.length,
      departmentTotals: deptTotals,
      monthlyTrends,
      salaryRanges
    };
  };

  const getChartData = () => {
    return {
      monthlyTrends: {
        labels: stats.monthlyTrends.map(t => t.month),
        datasets: [{
          label: 'Monthly Payroll',
          data: stats.monthlyTrends.map(t => t.total),
          borderColor: '#60B5FF',
          backgroundColor: 'rgba(96, 181, 255, 0.5)',
          tension: 0.4
        }]
      },
      departmentTotals: {
        labels: Object.keys(stats.departmentTotals),
        datasets: [{
          label: 'Department Totals',
          data: Object.values(stats.departmentTotals),
          backgroundColor: [
            'rgba(96, 181, 255, 0.5)',
            'rgba(255, 145, 73, 0.5)',
            'rgba(175, 221, 255, 0.5)',
            'rgba(255, 236, 219, 0.5)'
          ]
        }]
      },
      salaryRanges: {
        labels: Object.keys(stats.salaryRanges),
        datasets: [{
          label: 'Salary Ranges',
          data: Object.values(stats.salaryRanges),
          backgroundColor: [
            'rgba(96, 181, 255, 0.5)',
            'rgba(255, 145, 73, 0.5)',
            'rgba(175, 221, 255, 0.5)',
            'rgba(255, 236, 219, 0.5)',
            'rgba(128, 128, 128, 0.5)'
          ]
        }]
      }
    };
  };

  const handlePayrollSubmit = async (formData) => {
    setLoading(true);
    try {
      // Ensure all numeric fields are properly converted
      const payrollData = {
        ...formData,
        baseSalary: Number(formData.baseSalary) || 0,
        bonus: Number(formData.bonus) || 0,
        deductions: Number(formData.deductions) || 0,
        netSalary: Number(formData.netSalary) || 0,
        month: formData.month || new Date().toISOString().slice(0, 7),
        timestamp: serverTimestamp(),
        status: 'processed'
      };

      // Generate PDF
      const pdfBytes = await generatePDF(payrollData);
      const storageRef = ref(storage, `salary_slips/${payrollData.employeeId}_${payrollData.month}.pdf`);
      await uploadBytes(storageRef, pdfBytes);
      const downloadURL = await getDownloadURL(storageRef);

      // Save to Firestore
      await addDoc(collection(db, 'payroll'), {
        ...payrollData,
        slipUrl: downloadURL
      });

      setShowForm(false);
    } catch (error) {
      console.error('Error creating payroll:', error);
    }
    setLoading(false);
  };

  const handleBulkPayroll = async (department) => {
    setBulkProcessing(true);
    try {
      const batch = writeBatch(db);
      const employeesSnapshot = await getDocs(
        query(collection(db, 'employees'), where('department', '==', department))
      );

      for (const employeeDoc of employeesSnapshot.docs) {
        const employee = employeeDoc.data();
        const payrollData = {
          employeeId: employeeDoc.id,
          employeeName: employee.name,
          department: employee.department,
          month: filterMonth,
          baseSalary: employee.baseSalary || 0,
          bonus: 0,
          deductions: 0,
          netSalary: employee.baseSalary || 0,
          timestamp: serverTimestamp()
        };

        // Generate PDF
        const pdfBytes = await generatePDF(payrollData);
        const storageRef = ref(storage, `salary_slips/${payrollData.employeeId}_${payrollData.month}.pdf`);
        await uploadBytes(storageRef, pdfBytes);
        const downloadURL = await getDownloadURL(storageRef);

        const docRef = doc(collection(db, 'payroll'));
        batch.set(docRef, {
          ...payrollData,
          slipUrl: downloadURL
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('Error processing bulk payroll:', error);
    }
    setBulkProcessing(false);
  };

  const generatePDF = async (data) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Add company header
    page.drawText('COMPANY NAME', {
      x: 50,
      y: 750,
      size: 24,
      font,
      color: rgb(0.2, 0.4, 0.6)
    });

    // Add salary slip title
    page.drawText('SALARY SLIP', {
      x: 50,
      y: 700,
      size: 18,
      font
    });

    // Add employee details
    const details = [
      `Employee: ${data.employeeName}`,
      `Department: ${data.department}`,
      `Month: ${format(new Date(data.month), 'MMMM yyyy')}`,
      `Employee ID: ${data.employeeId}`,
      '',
      'Earnings:',
      `Base Salary: $${data.baseSalary}`,
      `Bonus: $${data.bonus}`,
      `Allowances: $${data.allowances || 0}`,
      '',
      'Deductions:',
      `Tax (${data.taxRate}%): $${data.tax}`,
      `Other Deductions: $${data.deductions}`,
      '',
      `Net Salary: $${data.netSalary}`
    ];

    details.forEach((text, index) => {
      page.drawText(text, {
        x: 50,
        y: 650 - (index * 25),
        size: 12,
        font
      });
    });

    return pdfDoc.save();
  };

  const filteredPayrolls = payrolls.filter(payroll => {
    const matchesSearch = 
      payroll.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payroll.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMonth = payroll.month === filterMonth;
    const matchesDepartment = selectedDepartment === 'all' || payroll.department === selectedDepartment;
    return matchesSearch && matchesMonth && matchesDepartment;
  });

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
              <p className="text-sm font-medium text-gray-500">Total Payroll</p>
              <p className="text-2xl font-bold text-primary mt-2">
                {formatCurrency(stats.totalPayroll)}
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
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold text-secondary mt-2">
                {stats.totalEmployees}
              </p>
            </div>
            <FaUsers className="w-8 h-8 text-secondary/20" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Processed Slips</p>
              <p className="text-2xl font-bold text-accent mt-2">
                {payrolls.length}
              </p>
            </div>
            <FaFileInvoiceDollar className="w-8 h-8 text-accent/20" />
          </div>
        </motion.div>
      </div>

      {/* Actions and Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>

          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />

          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="table">Table View</option>
            <option value="charts">Analytics View</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <FaPlus />
            New Payroll
          </button>
          <button
            onClick={() => handleBulkPayroll(selectedDepartment)}
            disabled={selectedDepartment === 'all' || bulkProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-highlight text-white rounded-lg hover:bg-highlight/90 transition-colors disabled:opacity-50"
          >
            {bulkProcessing ? (
              <>
                <FaSpinner className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FaUserTie />
                Bulk Process
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
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
                  Month
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Salary
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <FaSpinner className="w-6 h-6 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No payroll records found
                  </td>
                </tr>
              ) : (
                filteredPayrolls.map((payroll) => (
                  <motion.tr
                    key={payroll.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payroll.employeeName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payroll.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payroll.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatMonth(payroll.month)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(payroll.baseSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary text-right">
                      {formatCurrency(payroll.netSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payroll.status === 'processed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payroll.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <button
                        onClick={() => {
                          setSelectedPayroll(payroll);
                          setShowSlip(true);
                        }}
                        className="text-primary hover:text-primary/80 inline-flex items-center justify-center"
                        title="Download Slip"
                      >
                        <FaFileDownload className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
            <Line data={getChartData().monthlyTrends} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                }
              }
            }} />
          </motion.div>

          {/* Department Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
            <Doughnut data={getChartData().departmentTotals} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                }
              }
            }} />
          </motion.div>

          {/* Salary Ranges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm md:col-span-2"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Ranges</h3>
            <Bar data={getChartData().salaryRanges} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                }
              }
            }} />
          </motion.div>
        </div>
      )}

      {/* Payroll Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-semibold mb-4">New Payroll Entry</h2>
            <PayrollForm
              onSubmit={handlePayrollSubmit}
              onCancel={() => setShowForm(false)}
              loading={loading}
            />
          </motion.div>
        </div>
      )}

      {/* Salary Slip Modal */}
      {showSlip && selectedPayroll && (
        <SalarySlip
          slip={selectedPayroll}
          onClose={() => {
            setShowSlip(false);
            setSelectedPayroll(null);
          }}
          onDownload={() => generatePDF(selectedPayroll)}
          onPrint={() => window.print()}
        />
      )}
    </div>
  );
};

export default PayrollDashboard; 

 