import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaUser, FaClock, FaTags } from 'react-icons/fa';
import { format } from 'date-fns';

const categoryColors = {
  general: 'bg-blue-100 text-blue-800',
  urgent: 'bg-red-100 text-red-800',
  event: 'bg-green-100 text-green-800',
  notice: 'bg-yellow-100 text-yellow-800'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-yellow-100 text-yellow-800',
  urgent: 'bg-red-100 text-red-800'
};

const AnnouncementCard = ({ announcement, isAdmin, onEdit, onDelete }) => {
  const { title, content, category, priority, createdByEmail, tags = [] } = announcement;
  
  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return '';
    }
  };
  
  return (
    <motion.div
      layout
      className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${categoryColors[category?.toLowerCase() || 'general']}`}>
              {category || 'General'}
            </span>
            {priority && (
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${priorityColors[priority.toLowerCase()]}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </span>
            )}
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(announcement)}
              className="p-2 text-gray-500 hover:text-primary transition-colors"
              aria-label="Edit announcement"
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(announcement.id)}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              aria-label="Delete announcement"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="prose prose-sm max-w-none text-gray-600">
        {content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-2">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Media and Attachments */}
      {(announcement.mediaUrls?.length > 0 || announcement.attachments?.length > 0) && (
        <div className="mt-4 space-y-2">
          {announcement.mediaUrls?.map((media, index) => (
            <div key={`media-${index}`} className="inline-block mr-2">
              {media.type === 'image' ? (
                <img src={media.url} alt="" className="h-20 w-20 object-cover rounded" />
              ) : (
                <video src={media.url} className="h-20 w-20 object-cover rounded" controls />
              )}
            </div>
          ))}
          {announcement.attachments?.map((attachment, index) => (
            <a
              key={`attachment-${index}`}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-primary hover:underline"
            >
              {attachment.name}
            </a>
          ))}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 mt-4">
          <FaTags className="text-gray-400" />
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center text-xs text-gray-400 mt-4 space-x-4">
        <div className="flex items-center">
          <FaUser className="w-3 h-3 mr-1" />
          <span>{createdByEmail}</span>
        </div>
        <div className="flex items-center">
          <FaClock className="w-3 h-3 mr-1" />
          <span>{formatDate(announcement.createdAt)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AnnouncementCard; 
