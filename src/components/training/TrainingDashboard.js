import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FaGraduationCap, FaUsers, FaChartLine, FaClock } from 'react-icons/fa';
import TrainingCard from './TrainingCard';
import TrainingProgress from './TrainingProgress';
import { useAuth } from '../../context/AuthContext';

const StatsCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`mt-2 text-3xl font-semibold ${color}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color.replace('text-', 'bg-')}/10`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </motion.div>
);

const TrainingDashboard = ({ userId, isAdmin, onEditTraining }) => {
  const [trainings, setTrainings] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({
    activeTrainings: 0,
    totalEnrollments: 0,
    completionRate: 0,
    upcomingTrainings: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribeTrainings;
    let unsubscribeEnrollments;
    let unsubscribeAllEnrollments;

    const setupSubscriptions = async () => {
      try {
        // Subscribe to trainings with ordering
        const trainingsQuery = query(
          collection(db, 'trainings'),
          orderBy('createdAt', 'desc')
        );

        unsubscribeTrainings = onSnapshot(trainingsQuery, (snapshot) => {
          const trainingsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              startDate: data.startDate?.toDate?.() || new Date(data.startDate),
              endDate: data.endDate?.toDate?.() || new Date(data.endDate),
              createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
            };
          });
          
          setTrainings(trainingsData);
          
          // Calculate real-time stats
          const now = new Date();
          const activeCount = trainingsData.filter(t => {
            const start = new Date(t.startDate);
            const end = new Date(t.endDate);
            return start <= now && end >= now;
          }).length;
          
          const upcomingCount = trainingsData.filter(t => {
            const start = new Date(t.startDate);
            return start > now;
          }).length;
          
          setStats(prev => ({
            ...prev,
            activeTrainings: activeCount,
            upcomingTrainings: upcomingCount
          }));
        });

        // Subscribe to user enrollments
        if (!isAdmin && user?.uid) {
          const userEnrollmentsQuery = query(
            collection(db, 'enrollments'),
            where('userId', '==', user.uid)
          );

          unsubscribeEnrollments = onSnapshot(userEnrollmentsQuery, (snapshot) => {
            const enrollmentsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              enrolledAt: doc.data().enrolledAt?.toDate?.() || new Date(doc.data().enrolledAt)
            }));
            setEnrollments(enrollmentsData);
          });
        }

        // Subscribe to all enrollments for stats (admin only)
        if (isAdmin) {
          const allEnrollmentsQuery = query(collection(db, 'enrollments'));
          
          unsubscribeAllEnrollments = onSnapshot(allEnrollmentsQuery, (snapshot) => {
            const allEnrollments = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            const completedCount = allEnrollments.filter(e => e.status === 'completed').length;
            const completionRate = allEnrollments.length > 0
              ? Math.round((completedCount / allEnrollments.length) * 100)
              : 0;

            setStats(prev => ({
              ...prev,
              totalEnrollments: allEnrollments.length,
              completionRate
            }));
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error setting up subscriptions:', error);
        setLoading(false);
      }
    };

    setupSubscriptions();

    return () => {
      if (unsubscribeTrainings) unsubscribeTrainings();
      if (unsubscribeEnrollments) unsubscribeEnrollments();
      if (unsubscribeAllEnrollments) unsubscribeAllEnrollments();
    };
  }, [isAdmin, user]);

  const handleCreateTraining = async (formData) => {
    try {
      const trainingRef = await addDoc(collection(db, 'trainings'), {
        ...formData,
        createdBy: user.uid,
        createdAt: new Date(),
        status: 'upcoming',
        enrolledCount: 0
      });
      return trainingRef.id;
    } catch (error) {
      console.error('Error creating training:', error);
      throw error;
    }
  };

  const handleUpdateTraining = async (formData) => {
    try {
      const trainingRef = doc(db, 'trainings', formData.id);
      await updateDoc(trainingRef, {
        ...formData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating training:', error);
      throw error;
    }
  };

  const handleDeleteTraining = async (trainingId) => {
    if (window.confirm('Are you sure you want to delete this training?')) {
      try {
        await deleteDoc(doc(db, 'trainings', trainingId));
      } catch (error) {
        console.error('Error deleting training:', error);
        throw error;
      }
    }
  };

  const handleEnroll = async (training) => {
    try {
      // Check if already enrolled
      const existingEnrollment = enrollments.find(e => e.trainingId === training.id);
      if (existingEnrollment) {
        alert('You are already enrolled in this training.');
        return;
      }

      // Check capacity
      if (training.enrolledCount >= training.capacity) {
        alert('This training session is full.');
        return;
      }

      // Create enrollment
      await addDoc(collection(db, 'enrollments'), {
        userId: user.uid,
        trainingId: training.id,
        enrolledAt: new Date(),
        status: 'in_progress',
        progress: []
      });

      // Update training enrolled count
      await updateDoc(doc(db, 'trainings', training.id), {
        enrolledCount: (training.enrolledCount || 0) + 1
      });
    } catch (error) {
      console.error('Error enrolling in training:', error);
      throw error;
    }
  };

  const filteredTrainings = trainings.filter(training => {
    if (filter === 'all') return true;
    if (filter === 'enrolled') {
      return enrollments.some(e => e.trainingId === training.id);
    }
    if (filter === 'completed') {
      return enrollments.some(e => 
        e.trainingId === training.id && e.status === 'completed'
      );
    }
    if (filter === 'in_progress') {
      return enrollments.some(e => 
        e.trainingId === training.id && e.status === 'in_progress'
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Trainings"
          value={stats.activeTrainings}
          icon={FaGraduationCap}
          color="text-primary"
        />
        <StatsCard
          title="Total Enrollments"
          value={stats.totalEnrollments}
          icon={FaUsers}
          color="text-highlight"
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={FaChartLine}
          color="text-green-500"
        />
        <StatsCard
          title="Upcoming Trainings"
          value={stats.upcomingTrainings}
          icon={FaClock}
          color="text-yellow-500"
        />
      </div>

      {/* Filters */}
      {!isAdmin && (
        <div className="flex justify-end">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Trainings</option>
            <option value="enrolled">My Enrollments</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}

      {/* Training Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {filteredTrainings.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredTrainings.map(training => (
                <TrainingCard
                  key={training.id}
                  training={training}
                  isAdmin={isAdmin}
                  onEdit={onEditTraining}
                  onDelete={handleDeleteTraining}
                  onEnroll={handleEnroll}
                  isEnrolled={enrollments.some(e => e.trainingId === training.id)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              No trainings found
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Training Progress */}
      {!isAdmin && enrollments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">My Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map(enrollment => {
              const training = trainings.find(t => t.id === enrollment.trainingId);
              if (!training) return null;
              return (
                <TrainingProgress
                  key={enrollment.id}
                  training={training}
                  enrollment={enrollment}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingDashboard; 
