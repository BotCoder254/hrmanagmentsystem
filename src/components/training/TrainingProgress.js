import { motion } from 'framer-motion';
import { FaCheckCircle, FaPlay, FaClock } from 'react-icons/fa';

const TrainingProgress = ({ training, enrollment }) => {
  const getProgressPercentage = () => {
    if (!enrollment?.progress || !training?.modules?.length) return 0;
    return (enrollment.progress.length / training.modules.length) * 100;
  };

  const getModuleStatus = (moduleId) => {
    if (!enrollment?.progress) return 'pending';
    return enrollment.progress.includes(moduleId) ? 'completed' : 'pending';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <FaPlay className="w-5 h-5 text-blue-500" />;
      default:
        return <FaClock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">Overall Progress</h3>
          <span className="text-sm font-medium text-primary">
            {Math.round(getProgressPercentage())}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-primary"
          />
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {training?.modules?.map((module, index) => {
          const status = getModuleStatus(module.id);
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                {getStatusIcon(status)}
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {module.title}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Duration: {module.duration}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-medium capitalize ${
                status === 'completed' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {status}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TrainingProgress; 