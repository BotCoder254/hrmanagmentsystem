import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { FaStar, FaEdit, FaTrash, FaUser, FaClock } from 'react-icons/fa';

const PerformanceCard = ({ review, onEdit, onDelete, isAdmin }) => {
  const { rating, reviewDate, keyAchievements, areasForImprovement, goals, additionalComments } = review;

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      return format(new Date(dateString), 'MMM d, yyyy');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 space-y-4"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="flex">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={`w-5 h-5 ${
                    index < rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <FaClock className="w-4 h-4 mr-1" />
              {formatDate(reviewDate)}
            </div>
          </div>
          {review.employeeName && (
            <div className="flex items-center text-sm text-gray-600">
              <FaUser className="w-4 h-4 mr-2" />
              {review.employeeName}
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit(review)}
              className="p-2 text-gray-500 hover:text-primary transition-colors rounded-full hover:bg-gray-100"
              title="Edit review"
            >
              <FaEdit className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(review.id)}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
              title="Delete review"
            >
              <FaTrash className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>

      <div className="grid gap-4 pt-4 border-t border-gray-100">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Achievements</h4>
          <p className="text-sm text-gray-600 whitespace-pre-line">{keyAchievements}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Areas for Improvement</h4>
          <p className="text-sm text-gray-600 whitespace-pre-line">{areasForImprovement}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Goals and Objectives</h4>
          <p className="text-sm text-gray-600 whitespace-pre-line">{goals}</p>
        </div>

        {additionalComments && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Comments</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">{additionalComments}</p>
          </div>
        )}

        <div className="text-xs text-gray-400 flex items-center mt-2">
          <FaUser className="w-3 h-3 mr-1" />
          Reviewed by: {review.reviewerName}
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceCard; 
