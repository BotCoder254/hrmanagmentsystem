import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaUser, FaBook, FaUsers, FaCalendar } from 'react-icons/fa';
import { format } from 'date-fns';

const TrainingCard = ({ training, isAdmin, onEdit, onDelete, onEnroll, isEnrolled }) => {
  const { title, description, startDate, endDate, capacity, enrolledCount, instructor } = training;

  const formatDate = (date) => {
    if (!date) return '';
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const getStatusColor = () => {
    if (!startDate || !endDate) return 'bg-gray-100 text-gray-800';
    
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'bg-yellow-100 text-yellow-800';
    if (now > end) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusText = () => {
    if (!startDate || !endDate) return 'Not Scheduled';
    
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'Upcoming';
    if (now > end) return 'Completed';
    return 'In Progress';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{title || 'Untitled Training'}</h3>
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {isAdmin && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit?.(training)}
              className="p-2 text-gray-500 hover:text-primary transition-colors"
              aria-label="Edit training"
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete?.(training.id)}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              aria-label="Delete training"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-600 mb-4">{description || 'No description available'}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <FaCalendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <div>
            <p>Start: {formatDate(startDate) || 'Not set'}</p>
            <p>End: {formatDate(endDate) || 'Not set'}</p>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <FaUsers className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{enrolledCount || 0}/{capacity || 0} enrolled</span>
        </div>
      </div>

      <div className="flex items-center text-sm text-gray-500 mb-4">
        <FaUser className="w-4 h-4 mr-2 flex-shrink-0" />
        <span>Instructor: {instructor || 'Not assigned'}</span>
      </div>

      {training.resources?.length > 0 && (
        <div className="border-t border-gray-100 pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Resources</h4>
          <div className="space-y-2">
            {training.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-primary hover:underline"
              >
                <FaBook className="w-4 h-4 mr-2 flex-shrink-0" />
                {resource.name || 'Untitled Resource'}
              </a>
            ))}
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onEnroll?.(training)}
            disabled={isEnrolled || getStatusText() === 'Completed'}
            className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-colors ${
              isEnrolled
                ? 'bg-green-500 cursor-not-allowed'
                : getStatusText() === 'Completed'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {isEnrolled ? 'Enrolled' : 'Enroll Now'}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default TrainingCard; 
