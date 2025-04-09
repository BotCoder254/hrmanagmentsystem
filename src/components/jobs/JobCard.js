import { motion } from 'framer-motion';
import { 
  FaBriefcase, 
  FaBuilding, 
  FaCalendar, 
  FaUsers, 
  FaEdit, 
  FaTrash,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaUserGraduate,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle
} from 'react-icons/fa';
import { format } from 'date-fns';

const JobCard = ({ job, onEdit, onDelete, isAdmin, onRefer, myReferral }) => {
  const { 
    title, 
    department, 
    location, 
    type, 
    requirements = [], 
    postedDate, 
    status,
    salary,
    experience,
    education,
    skills = [],
    benefits = [],
    deadline,
    referrals = {}
  } = job || {};

  // Count referrals properly from the referrals object
  const referralCount = Object.keys(referrals || {}).length;

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    closed: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800'
  };

  const applicationStatusColors = {
    approved: 'text-green-500',
    rejected: 'text-red-500',
    pending: 'text-yellow-500'
  };

  const applicationStatusIcons = {
    approved: <FaCheckCircle className="w-4 h-4" />,
    rejected: <FaTimesCircle className="w-4 h-4" />,
    pending: <FaHourglassHalf className="w-4 h-4" />
  };

  // Ensure arrays are properly formatted
  const formattedRequirements = Array.isArray(requirements) ? requirements : [];
  const formattedSkills = Array.isArray(skills) ? skills : [];
  const formattedBenefits = Array.isArray(benefits) ? benefits : [];

  // Format date safely
  const formatDateSafely = (dateValue) => {
    try {
      if (!dateValue) return '';
      const date = dateValue?.toDate?.() || new Date(dateValue);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return '';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">{title || 'Untitled Position'}</h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {department && (
              <div className="flex items-center">
                <FaBuilding className="w-4 h-4 mr-2" />
                {department}
              </div>
            )}
            {type && (
              <div className="flex items-center">
                <FaBriefcase className="w-4 h-4 mr-2" />
                {type}
              </div>
            )}
            {location && (
              <div className="flex items-center">
                <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                {location}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.draft}`}>
            {status || 'draft'}
          </span>
          {myReferral && (
            <div className={`flex items-center gap-1 text-xs font-medium ${applicationStatusColors[myReferral.status]}`}>
              {applicationStatusIcons[myReferral.status]}
              <span>Application {myReferral.status}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {salary && (
          <div className="flex items-center text-sm text-gray-600">
            <FaMoneyBillWave className="w-4 h-4 mr-2" />
            {salary}
          </div>
        )}
        {experience && (
          <div className="flex items-center text-sm text-gray-600">
            <FaClock className="w-4 h-4 mr-2" />
            {experience} experience
          </div>
        )}
        {education && (
          <div className="flex items-center text-sm text-gray-600">
            <FaUserGraduate className="w-4 h-4 mr-2" />
            {education}
          </div>
        )}
        {deadline && (
          <div className="flex items-center text-sm text-gray-600">
            <FaCalendar className="w-4 h-4 mr-2" />
            Apply by {formatDateSafely(deadline)}
          </div>
        )}
      </div>

      {formattedSkills.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Required Skills:</h4>
          <div className="flex flex-wrap gap-2">
            {formattedSkills.map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {formattedRequirements.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Requirements:</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {formattedRequirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {formattedBenefits.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Benefits:</h4>
          <div className="flex flex-wrap gap-2">
            {formattedBenefits.map((benefit, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-600">
          <FaUsers className="w-4 h-4 mr-2" />
          {referralCount} Referrals
          {postedDate && (
            <>
              <span className="mx-2">•</span>
              <FaCalendar className="w-4 h-4 mr-2" />
              Posted {formatDateSafely(postedDate)}
            </>
          )}
        </div>

        <div className="flex space-x-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => onEdit(job)}
                className="p-2 text-gray-500 hover:text-primary transition-colors rounded-full hover:bg-gray-100"
                title="Edit job"
              >
                <FaEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(job.id)}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
                title="Delete job"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </>
          ) : (
            status === 'active' && !myReferral && (
              <button
                onClick={() => onRefer(job)}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Refer Candidate
              </button>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard; 
