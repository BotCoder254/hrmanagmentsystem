import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import TaskList from '../../components/tasks/TaskList';
import TaskForm from '../../components/tasks/TaskForm';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';

const TasksPage = ({ isAdmin = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { user } = useAuth();

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setShowModal(false);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isAdmin ? 'Task Management' : 'My Tasks'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isAdmin
                ? 'Manage and assign tasks to employees'
                : 'View and manage your assigned tasks'}
            </p>
          </div>

          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
            >
              <span>Create Task</span>
            </motion.button>
          )}
        </div>

        <TaskList onEditTask={handleEditTask} />

        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={selectedTask ? 'Edit Task' : 'Create Task'}
        >
          <TaskForm
            task={selectedTask}
            onClose={handleCloseModal}
            onSuccess={handleSuccess}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default TasksPage; 
