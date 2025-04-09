import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  FaFileDownload, 
  FaFilePdf, 
  FaFileExcel, 
  FaPrint,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaPlus
} from 'react-icons/fa';
import { format } from 'date-fns';
import DashboardLayout from '../../layouts/DashboardLayout';
import PerformanceForm from '../../components/performance/PerformanceForm';
import PerformanceCard from '../../components/performance/PerformanceCard';
import { useAuth } from '../../context/AuthContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PerformancePage = ({ isAdmin = false }) => {
  const [reviews, setReviews] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeChart, setActiveChart] = useState('line');
  const { user } = useAuth();

  useEffect(() => {
    // Fetch employees for admin
    if (isAdmin) {
      const unsubscribeEmployees = onSnapshot(
        collection(db, 'employees'),
        (snapshot) => {
          const employeeData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setEmployees(employeeData);
        }
      );
      return () => unsubscribeEmployees();
    }
  }, [isAdmin]);

  useEffect(() => {
    let unsubscribe;

    const fetchReviews = () => {
      let reviewsQuery;
      
      if (isAdmin) {
        reviewsQuery = query(collection(db, 'performance'));
      } else {
        reviewsQuery = query(
          collection(db, 'performance'),
          where('employeeId', '==', user.uid)
        );
      }

      unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));

        const sortedReviews = reviewsData.sort((a, b) => 
          new Date(b.reviewDate) - new Date(a.reviewDate)
        );

        setReviews(sortedReviews);
      });
    };

    if (user?.uid) {
      fetchReviews();
    }

    return () => unsubscribe?.();
  }, [user?.uid, isAdmin]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const reviewData = {
        ...formData,
        employeeId: selectedEmployee?.id || user.uid,
        employeeName: selectedEmployee?.name || user.displayName || user.email,
        reviewerId: user.uid,
        reviewerName: user.displayName || user.email,
        timestamp: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (selectedReview) {
        await updateDoc(doc(db, 'performance', selectedReview.id), {
          ...reviewData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'performance'), reviewData);
      }
      setIsFormOpen(false);
      setSelectedReview(null);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Error saving performance review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review) => {
    setSelectedReview(review);
    setSelectedEmployee(employees.find(emp => emp.id === review.employeeId));
    setIsFormOpen(true);
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteDoc(doc(db, 'performance', reviewId));
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Employee Name', 'Rating', 'Review Date', 'Key Achievements', 'Areas for Improvement', 'Goals'];
    const csvData = reviews.map(review => [
      review.employeeName,
      review.rating,
      format(new Date(review.reviewDate), 'yyyy-MM-dd'),
      review.keyAchievements,
      review.areasForImprovement,
      review.goals
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'performance_reviews.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Chart data preparation
  const chartData = {
    labels: reviews.map(r => format(new Date(r.reviewDate), 'MMM d, yyyy')),
    datasets: [{
      label: 'Performance Ratings',
      data: reviews.map(r => r.rating),
      backgroundColor: 'rgba(96, 181, 255, 0.5)',
      borderColor: '#60B5FF',
      borderWidth: 2
    }]
  };

  const radarData = {
    labels: ['Goals Achievement', 'Communication', 'Technical Skills', 'Leadership', 'Innovation'],
    datasets: [{
      label: 'Current Performance',
      data: reviews.length > 0 ? [
        reviews[0].rating,
        reviews[0].communicationScore || 0,
        reviews[0].technicalScore || 0,
        reviews[0].leadershipScore || 0,
        reviews[0].innovationScore || 0
      ] : [0, 0, 0, 0, 0],
      backgroundColor: 'rgba(96, 181, 255, 0.2)',
      borderColor: '#60B5FF',
      borderWidth: 2
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Performance Trend'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Performance Reviews</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin 
                ? 'Manage employee performance reviews' 
                : 'View your performance reviews'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-2">
              <button
                onClick={() => setActiveChart('line')}
                className={`p-2 rounded-lg transition-colors ${
                  activeChart === 'line' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaChartLine className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveChart('bar')}
                className={`p-2 rounded-lg transition-colors ${
                  activeChart === 'bar' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaChartBar className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveChart('radar')}
                className={`p-2 rounded-lg transition-colors ${
                  activeChart === 'radar' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaChartPie className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportToCSV}
                className="p-2 text-gray-600 hover:text-primary transition-colors"
                title="Export to CSV"
              >
                <FaFileExcel className="w-5 h-5" />
              </button>
              <button
                onClick={handlePrint}
                className="p-2 text-gray-600 hover:text-primary transition-colors"
                title="Print"
              >
                <FaPrint className="w-5 h-5" />
              </button>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  setSelectedReview(null);
                  setSelectedEmployee(null);
                  setIsFormOpen(true);
                }}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>New Review</span>
              </button>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            {activeChart === 'line' && <Line data={chartData} options={chartOptions} />}
            {activeChart === 'bar' && <Bar data={chartData} options={chartOptions} />}
            {activeChart === 'radar' && <Radar data={radarData} />}
          </motion.div>

          {/* Performance Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-4">Performance Statistics</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-2xl font-semibold text-primary">
                    {reviews.length > 0
                      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-semibold text-primary">{reviews.length}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-semibold mb-4">
                {selectedReview ? 'Edit Review' : 'New Review'}
              </h2>

              {isAdmin && !selectedEmployee && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Employee
                  </label>
                  <select
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    onChange={(e) => {
                      const employee = employees.find(emp => emp.id === e.target.value);
                      setSelectedEmployee(employee);
                    }}
                    value={selectedEmployee?.id || ''}
                  >
                    <option value="">Select an employee</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} ({employee.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(selectedEmployee || !isAdmin) && (
                <PerformanceForm
                  initialData={selectedReview}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setSelectedReview(null);
                    setSelectedEmployee(null);
                  }}
                  loading={loading}
                />
              )}
            </motion.div>
          </div>
        )}

        {/* Reviews List */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {reviews.map(review => (
              <PerformanceCard
                key={review.id}
                review={review}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isAdmin={isAdmin}
              />
            ))}
          </AnimatePresence>
          {reviews.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              No performance reviews available
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PerformancePage; 
