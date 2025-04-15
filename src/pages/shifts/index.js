import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import ShiftCalendar from '../../components/shifts/ShiftCalendar';
import ShiftForm from '../../components/shifts/ShiftForm';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import * as shiftService from '../../services/shiftService';

const ShiftsPage = ({ isAdmin = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await shiftService.getEmployees();
        setEmployees(data);
      } catch (err) {
        setError('Failed to fetch employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [user]);

  const handleShiftClick = (shift) => {
    setSelectedShift(shift);
    setShowModal(true);
  };

  const handleCreateShift = async (shiftData) => {
    try {
      await shiftService.createShift(shiftData);
      setShowModal(false);
      setSelectedShift(null);
    } catch (error) {
      setError('Failed to create shift');
    }
  };

  const handleUpdateShift = async (shiftData) => {
    try {
      await shiftService.updateShift(selectedShift.id, shiftData);
      setShowModal(false);
      setSelectedShift(null);
    } catch (error) {
      setError('Failed to update shift');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedShift(null);
    setError(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isAdmin ? 'Shift Management' : 'My Shifts'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isAdmin
                ? 'Manage employee shifts and schedules'
                : 'View and manage your shifts'}
            </p>
          </div>

          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
            >
              <span>Create Shift</span>
            </motion.button>
          )}
        </div>

        <ShiftCalendar
          employees={employees}
          isAdmin={isAdmin}
          onShiftClick={handleShiftClick}
        />

        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={selectedShift ? 'Edit Shift' : 'Create Shift'}
        >
          <ShiftForm
            shift={selectedShift}
            employees={employees}
            onSubmit={selectedShift ? handleUpdateShift : handleCreateShift}
            onCancel={handleCloseModal}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ShiftsPage; 