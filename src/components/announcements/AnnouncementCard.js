import { motion } from 'framer-motion';
import { FaEdit, FaTrash } from 'react-icons/fa';

const categoryColors = {
  general: 'bg-blue-100 text-blue-800',
  urgent: 'bg-red-100 text-red-800',
  event: 'bg-green-100 text-green-800',
  notice: 'bg-yellow-100 text-yellow-800'
};

const AnnouncementCard = ({ announcement, isAdmin, onEdit, onDelete }) => {
  const { title, content, category } = announcement;
  
  return (
    <motion.div
      layout
      className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${categoryColors[category.toLowerCase()]}`}>
            {category}
          </span>
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
    </motion.div>
  );
};

export default AnnouncementCard; 
