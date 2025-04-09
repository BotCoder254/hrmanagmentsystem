import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import AnnouncementCard from './AnnouncementCard';

const timelineVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

const AnnouncementsTimeline = ({ announcements, isAdmin, onEdit, onDelete }) => {
  if (!announcements?.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-10 text-gray-500"
      >
        No announcements available
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={timelineVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <AnimatePresence mode="popLayout">
        {announcements.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            variants={itemVariants}
            layout
            className="relative pl-8 pb-6"
          >
            {/* Timeline line */}
            {index !== announcements.length - 1 && (
              <div className="absolute left-4 top-6 bottom-0 w-0.5 bg-gray-200" />
            )}
            
            {/* Timeline dot */}
            <div className="absolute left-2.5 top-3 w-3 h-3 rounded-full bg-primary" />
            
            {/* Announcement card */}
            <AnnouncementCard
              announcement={announcement}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
            />
            
            {/* Timestamp */}
            <div className="mt-2 text-sm text-gray-500">
              {format(new Date(announcement.timestamp), 'MMM d, yyyy h:mm a')}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnnouncementsTimeline; 