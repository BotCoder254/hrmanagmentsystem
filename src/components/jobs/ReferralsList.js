import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns';
import { FaCheck, FaTimes, FaSpinner, FaFileDownload, FaPrint } from 'react-icons/fa';

const ReferralsList = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'referrals'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const referralsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));
      setReferrals(referralsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (referralId, newStatus) => {
    try {
      const referralRef = doc(db, 'referrals', referralId);
      await updateDoc(referralRef, {
        status: newStatus,
        updatedAt: new Date()
      });

      // Also update the job's referral status
      const referral = referrals.find(r => r.id === referralId);
      if (referral?.jobId) {
        const jobRef = doc(db, 'jobs', referral.jobId);
        await updateDoc(jobRef, {
          [`referrals.${referralId}.status`]: newStatus
        });
      }
    } catch (error) {
      console.error('Error updating referral status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Candidate Name', 'Email', 'Phone', 'Job Title', 'Referred By', 'Status', 'Date'];
    const csvData = referrals.map(referral => [
      referral.candidateName,
      referral.candidateEmail,
      referral.candidatePhone || 'N/A',
      referral.jobTitle,
      referral.referrerName,
      referral.status,
      format(referral.createdAt, 'MMM d, yyyy')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `referrals_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const filteredReferrals = selectedStatus === 'all'
    ? referrals
    : referrals.filter(referral => referral.status.toLowerCase() === selectedStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Referrals</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <span className="text-sm text-gray-500">
            {filteredReferrals.length} referrals
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FaFileDownload />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FaPrint />
            <span>Print</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Referred By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReferrals.map((referral) => (
              <motion.tr
                key={referral.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                layout
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {referral.candidateName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {referral.candidateEmail}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{referral.jobTitle}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{referral.referrerName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(referral.status)}`}>
                    {referral.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(referral.createdAt, 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {referral.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(referral.id, 'approved')}
                        className="text-green-600 hover:text-green-900"
                        title="Approve referral"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => handleStatusChange(referral.id, 'rejected')}
                        className="text-red-600 hover:text-red-900"
                        title="Reject referral"
                      >
                        <FaTimes />
                      </button>
                    </>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filteredReferrals.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No referrals found
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralsList; 
