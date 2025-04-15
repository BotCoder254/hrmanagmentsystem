import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendar, FaClock, FaComment } from 'react-icons/fa';

const ShiftChangeRequest = ({ shift, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    requestedDate: '',
    requestedStartTime: '',
    requestedEndTime: '',
    reason: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.requestedDate) newErrors.requestedDate = 'New date is required';
    if (!formData.requestedStartTime) newErrors.requestedStartTime = 'New start time is required';
    if (!formData.requestedEndTime) newErrors.requestedEndTime = 'New end time is required';
    if (!formData.reason) newErrors.reason = 'Reason is required';

    if (formData.requestedStartTime && formData.requestedEndTime &&
        new Date(formData.requestedStartTime) >= new Date(formData.requestedEndTime)) {
      newErrors.requestedEndTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        shiftId: shift.id,
        requestedStartTime: new Date(formData.requestedStartTime).toISOString(),
        requestedEndTime: new Date(formData.requestedEndTime).toISOString(),
        requestedDate: new Date(formData.requestedDate).toISOString(),
        status: 'pending'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Shift Details</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Date:</span>{' '}
            {new Date(shift.date).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Time:</span>{' '}
            {new Date(shift.startTime).toLocaleTimeString()} - {new Date(shift.endTime).toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Requested Changes</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Date
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="requestedDate"
                value={formData.requestedDate}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.requestedDate ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm`}
              />
            </div>
            {errors.requestedDate && (
              <p className="mt-1 text-sm text-red-600">{errors.requestedDate}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Start Time
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaClock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  name="requestedStartTime"
                  value={formData.requestedStartTime}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.requestedStartTime ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm`}
                />
              </div>
              {errors.requestedStartTime && (
                <p className="mt-1 text-sm text-red-600">{errors.requestedStartTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New End Time
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaClock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  name="requestedEndTime"
                  value={formData.requestedEndTime}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.requestedEndTime ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm`}
                />
              </div>
              {errors.requestedEndTime && (
                <p className="mt-1 text-sm text-red-600">{errors.requestedEndTime}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Change
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaComment className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={3}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.reason ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm`}
                placeholder="Please provide a reason for the shift change request..."
              />
            </div>
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Submit Request
        </motion.button>
      </div>
    </form>
  );
};

export default ShiftChangeRequest; 
