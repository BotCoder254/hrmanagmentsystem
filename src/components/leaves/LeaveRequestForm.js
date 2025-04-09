import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendar, FaClipboard, FaUser } from 'react-icons/fa';

const InputField = ({ icon: Icon, label, error, className = '', ...props }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        className={`block w-full pl-10 pr-3 py-2 border ${
          error ? 'border-red-300' : 'border-gray-300'
        } rounded-md focus:outline-none focus:ring-1 ${
          error ? 'focus:ring-red-500' : 'focus:ring-primary'
        } focus:border-primary sm:text-sm`}
        {...props}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const SelectField = ({ icon: Icon, label, error, options, className = '', ...props }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <select
        className={`block w-full pl-10 pr-3 py-2 border ${
          error ? 'border-red-300' : 'border-gray-300'
        } rounded-md focus:outline-none focus:ring-1 ${
          error ? 'focus:ring-red-500' : 'focus:ring-primary'
        } focus:border-primary sm:text-sm bg-white`}
        {...props}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const TextArea = ({ icon: Icon, label, error, className = '', ...props }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative rounded-md shadow-sm">
      <div className="absolute left-3 top-3 pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <textarea
        className={`block w-full pl-10 pr-3 py-2 border ${
          error ? 'border-red-300' : 'border-gray-300'
        } rounded-md focus:outline-none focus:ring-1 ${
          error ? 'focus:ring-red-500' : 'focus:ring-primary'
        } focus:border-primary sm:text-sm min-h-[100px]`}
        {...props}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const LeaveRequestForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'annual',
    reason: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'personal', label: 'Personal Leave' },
    { value: 'unpaid', label: 'Unpaid Leave' }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.type) newErrors.type = 'Leave type is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    
    // Validate date range
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting leave request:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to submit request' }));
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          id="startDate"
          name="startDate"
          type="date"
          label="Start Date"
          icon={FaCalendar}
          value={formData.startDate}
          onChange={handleChange}
          error={errors.startDate}
          required
        />

        <InputField
          id="endDate"
          name="endDate"
          type="date"
          label="End Date"
          icon={FaCalendar}
          value={formData.endDate}
          onChange={handleChange}
          error={errors.endDate}
          required
        />

        <SelectField
          id="type"
          name="type"
          label="Leave Type"
          icon={FaUser}
          value={formData.type}
          onChange={handleChange}
          error={errors.type}
          options={leaveTypes}
          required
        />
      </div>

      <TextArea
        id="reason"
        name="reason"
        label="Reason for Leave"
        icon={FaClipboard}
        value={formData.reason}
        onChange={handleChange}
        error={errors.reason}
        placeholder="Please provide details about your leave request..."
        required
      />

      {errors.submit && (
        <p className="text-red-500 text-sm text-center">{errors.submit}</p>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {loading ? 'Submitting...' : initialData ? 'Update Request' : 'Submit Request'}
        </button>
      </div>
    </motion.form>
  );
};

export default LeaveRequestForm; 