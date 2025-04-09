import { useState } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const ReferralForm = ({ job, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    candidateResume: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!job || !user) {
      setError('Unable to submit referral. Please try again later.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Create the referral document
      const referralData = {
        ...formData,
        jobId: job.id,
        jobTitle: job.title,
        status: 'pending',
        referrerId: user.uid,
        referrerName: user.displayName || user.email,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const referralDoc = await addDoc(collection(db, 'referrals'), referralData);

      // Update the job document with the referral
      const jobRef = doc(db, 'jobs', job.id);
      await updateDoc(jobRef, {
        [`referrals.${referralDoc.id}`]: {
          candidateName: formData.candidateName,
          status: 'pending',
          referredBy: user.uid,
          referredAt: new Date()
        }
      });

      onSuccess?.();
    } catch (err) {
      console.error('Error submitting referral:', err);
      setError('Failed to submit referral. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!job) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Refer a Candidate
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900">
          {job.title}
        </h3>
        <p className="text-sm text-gray-500">
          Department: {job.department}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700">
            Candidate Name *
          </label>
          <input
            type="text"
            id="candidateName"
            name="candidateName"
            required
            value={formData.candidateName}
            onChange={handleChange}
            className="mt-1 block w-full h-10 px-3 rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="candidateEmail" className="block text-sm font-medium text-gray-700">
            Candidate Email *
          </label>
          <input
            type="email"
            id="candidateEmail"
            name="candidateEmail"
            required
            value={formData.candidateEmail}
            onChange={handleChange}
            className="mt-1 block w-full h-10 px-3 rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="candidatePhone" className="block text-sm font-medium text-gray-700">
            Candidate Phone
          </label>
          <input
            type="tel"
            id="candidatePhone"
            name="candidatePhone"
            value={formData.candidatePhone}
            onChange={handleChange}
            className="mt-1 block w-full h-10 px-3 rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="candidateResume" className="block text-sm font-medium text-gray-700">
            Resume Link
          </label>
          <input
            type="url"
            id="candidateResume"
            name="candidateResume"
            value={formData.candidateResume}
            onChange={handleChange}
            placeholder="https://..."
            className="mt-1 block w-full h-10 px-3 rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 resize-none"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Referral'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ReferralForm; 
