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
import DashboardLayout from '../../layouts/DashboardLayout';
import JobForm from '../../components/jobs/JobForm';
import JobCard from '../../components/jobs/JobCard';
import JobMetrics from '../../components/jobs/JobMetrics';
import ReferralForm from '../../components/jobs/ReferralForm';
import ReferralsList from '../../components/jobs/ReferralsList';
import MyApplications from '../../components/jobs/MyApplications';
import { useAuth } from '../../context/AuthContext';

const JobsPage = ({ isAdmin = false }) => {
  const [jobs, setJobs] = useState([]);
  const [myReferrals, setMyReferrals] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [referralJob, setReferralJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const { user } = useAuth();

  useEffect(() => {
    const jobsQuery = isAdmin
      ? query(collection(db, 'jobs'))
      : query(collection(db, 'jobs'), where('status', '==', 'active'));

    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsData);
      setLoading(false);
    });

    // Fetch user's referrals if not admin
    let unsubscribeReferrals = () => {};
    if (!isAdmin && user?.uid) {
      const referralsQuery = query(
        collection(db, 'referrals'),
        where('referrerId', '==', user.uid)
      );

      unsubscribeReferrals = onSnapshot(referralsQuery, (snapshot) => {
        const referralsMap = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          referralsMap[data.jobId] = {
            id: doc.id,
            ...data
          };
        });
        setMyReferrals(referralsMap);
      });
    }

    return () => {
      unsubscribeJobs();
      unsubscribeReferrals();
    };
  }, [isAdmin, user]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const jobData = {
        ...formData,
        status: formData.status || 'active',
        postedDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
        referrals: {}
      };

      if (selectedJob) {
        await updateDoc(doc(db, 'jobs', selectedJob.id), {
          ...jobData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'jobs'), jobData);
      }
      setIsFormOpen(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Error saving job:', error);
    }
    setLoading(false);
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setIsFormOpen(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteDoc(doc(db, 'jobs', jobId));
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const handleRefer = (job) => {
    setReferralJob(job);
  };

  const handleReferralSubmit = async (referralData) => {
    try {
      const referral = {
        ...referralData,
        jobId: referralJob.id,
        jobTitle: referralJob.title,
        referrerId: user.uid,
        referrerName: user.displayName || user.email,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'referrals'), referral);
      setReferralJob(null);
    } catch (error) {
      console.error('Error submitting referral:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Jobs</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? 'Manage job postings' : 'Browse available positions'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setSelectedJob(null);
                setIsFormOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Job
            </button>
          )}
        </div>

        {!isAdmin && (
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'jobs'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Available Jobs
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Applications
              </button>
            </nav>
          </div>
        )}

        {isAdmin && <JobMetrics jobs={jobs} />}

        {activeTab === 'jobs' ? (
          <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRefer={handleRefer}
                  isAdmin={isAdmin}
                  myReferral={myReferrals[job.id]}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <MyApplications />
        )}

        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <JobForm
              initialData={selectedJob}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedJob(null);
              }}
              loading={loading}
            />
          </div>
        )}

        {referralJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <ReferralForm
              job={referralJob}
              onClose={() => setReferralJob(null)}
              onSuccess={() => {
                setReferralJob(null);
              }}
            />
          </div>
        )}

        {isAdmin && <ReferralsList />}
      </div>
    </DashboardLayout>
  );
};

export default JobsPage; 
