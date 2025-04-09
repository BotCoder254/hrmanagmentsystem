import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';
import { format } from 'date-fns';

const JobProgress = ({ referral }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <FaCheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <FaTimesCircle className="w-5 h-5" />;
      default:
        return <FaHourglassHalf className="w-5 h-5" />;
    }
  };

  const formatDate = (date) => {
    try {
      return format(date instanceof Date ? date : new Date(date), 'MMM d, yyyy');
    } catch (error) {
      return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{referral.jobTitle}</h3>
        <div className={`flex items-center ${getStatusColor(referral.status)}`}>
          {getStatusIcon(referral.status)}
          <span className="ml-2 text-sm font-medium capitalize">{referral.status}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">Candidate</p>
          <p className="text-sm font-medium text-gray-900">{referral.candidateName}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Contact</p>
          <p className="text-sm font-medium text-gray-900">{referral.candidateEmail}</p>
          {referral.candidatePhone && (
            <p className="text-sm font-medium text-gray-900">{referral.candidatePhone}</p>
          )}
        </div>

        {referral.notes && (
          <div>
            <p className="text-sm text-gray-500">Notes</p>
            <p className="text-sm text-gray-600">{referral.notes}</p>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Referred on {formatDate(referral.createdAt)}
          </p>
          {referral.updatedAt && referral.updatedAt !== referral.createdAt && (
            <p className="text-xs text-gray-400">
              Last updated {formatDate(referral.updatedAt)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default JobProgress; 