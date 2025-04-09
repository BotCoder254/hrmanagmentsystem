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
import { useAuth } from '../../context/AuthContext';

const JobsPage = ({ isAdmin = false }) => {
  const [jobs, setJobs] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReferralFormOpen, setIsReferralFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs', 'metrics', 'referrals'
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'jobs'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const jobsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          postedDate: data.postedDate?.toDate?.() || data.postedDate || new Date(),
          deadline: data.deadline?.toDate?.() || data.deadline || null,
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date()
        };
      });
      setJobs(jobsData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const jobData = {
        ...formData,
        status: formData.status || 'active',
        postedBy: user.id,
        postedDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (selectedJob) {
        await updateDoc(doc(db, 'jobs', selectedJob.id), {
          ...jobData,
          updatedAt: serverTimestamp(),
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
    setSelectedJob(job);
    setIsReferralFormOpen(true);
  };

  const handleReferralSubmit = async (referralData) => {
    setLoading(true);
    try {
      const referralDoc = {
        ...referralData,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        referredBy: user.id,
        referrerName: user.email,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'referrals'), referralDoc);

      // Update job's referral count
      const jobRef = doc(db, 'jobs', selectedJob.id);
      await updateDoc(jobRef, {
        referrals: (selectedJob.referrals || []).concat({
          referralId: referralDoc.id,
          candidateName: referralData.candidateName,
          status: 'pending'
        })
      });

      setIsReferralFormOpen(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Error submitting referral:', error);
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Jobs</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? 'Manage job postings and view metrics' : 'View and refer candidates for open positions'}
            </p>
          </div>
          <div className="flex space-x-4">
            {isAdmin && (
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setIsFormOpen(true);
                }}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Post New Job
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Job Listings
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('metrics')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'metrics'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Metrics
                </button>
                <button
                  onClick={() => setActiveTab('referrals')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'referrals'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Referrals
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'jobs' && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRefer={handleRefer}
                  isAdmin={isAdmin}
                />
              ))}
              {jobs.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No jobs available
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'metrics' && isAdmin && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <JobMetrics jobs={jobs} />
            </motion.div>
          )}

          {activeTab === 'referrals' && isAdmin && (
            <motion.div
              key="referrals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ReferralsList />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-semibold mb-4">
                {selectedJob ? 'Edit Job' : 'Post New Job'}
              </h2>
              <JobForm
                initialData={selectedJob}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedJob(null);
                }}
                loading={loading}
              />
            </motion.div>
          </div>
        )}

        {/* Referral Form Modal */}
        {isReferralFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md m-4"
            >
              <h2 className="text-2xl font-semibold mb-4">Refer a Candidate</h2>
              <ReferralForm
                job={selectedJob}
                onClose={() => {
                  setIsReferralFormOpen(false);
                  setSelectedJob(null);
                }}
                onSuccess={() => {
                  setIsReferralFormOpen(false);
                  setSelectedJob(null);
                }}
              />
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobsPage; 
