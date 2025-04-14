import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import TrainingDashboard from '../../components/training/TrainingDashboard';
import TrainingForm from '../../components/training/TrainingForm';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';

const TrainingPage = ({ isAdmin = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const { user } = useAuth();

  const handleEditTraining = (training) => {
    setSelectedTraining(training);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedTraining(null);
    setShowModal(false);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setSelectedTraining(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isAdmin ? 'Training Management' : 'Training & Development'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isAdmin
                ? 'Create and manage training sessions'
                : 'View and enroll in training programs'}
            </p>
          </div>

          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
            >
              <span>Create Training</span>
            </motion.button>
          )}
        </div>

        <TrainingDashboard 
          userId={user?.uid} 
          isAdmin={isAdmin} 
          onEditTraining={handleEditTraining}
        />

        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={selectedTraining ? 'Edit Training' : 'Create Training'}
        >
          <TrainingForm
            initialData={selectedTraining}
            onClose={handleCloseModal}
            onSuccess={handleSuccess}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default TrainingPage;

 