import { useState } from 'react';
import { FaUser, FaClock, FaCalendar } from 'react-icons/fa';
import { format } from 'date-fns';

const InputField = ({ icon: Icon, label, error, className = '', ...props }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        className={`block w-full pl-10 pr-3 py-2 border ${
          error ? 'border-red-300' : 'border-gray-300'
        } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const SelectField = ({ icon: Icon, label, error, options, className = '', ...props }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <select
        className={`block w-full pl-10 pr-3 py-2 border ${
          error ? 'border-red-300' : 'border-gray-300'
        } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const ShiftForm = ({ shift, employees, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    employeeId: shift?.employeeId || '',
    type: shift?.type || 'morning',
    date: shift?.date ? format(new Date(shift.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: shift?.startTime || '09:00',
    endTime: shift?.endTime || '17:00',
  });

  const [errors, setErrors] = useState({});

  const shiftTypes = [
    { value: 'morning', label: 'Morning Shift (9 AM - 5 PM)' },
    { value: 'afternoon', label: 'Afternoon Shift (2 PM - 10 PM)' },
    { value: 'night', label: 'Night Shift (10 PM - 6 AM)' },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeId) newErrors.employeeId = 'Employee is required';
    if (!formData.type) newErrors.type = 'Shift type is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const shiftData = {
      ...formData,
      date: new Date(formData.date),
      startTime: new Date(`${formData.date}T${formData.startTime}`),
      endTime: new Date(`${formData.date}T${formData.endTime}`),
    };

    onSubmit(shiftData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTypeChange = (e) => {
    const { value } = e.target;
    let startTime, endTime;

    switch (value) {
      case 'morning':
        startTime = '09:00';
        endTime = '17:00';
        break;
      case 'afternoon':
        startTime = '14:00';
        endTime = '22:00';
        break;
      case 'night':
        startTime = '22:00';
        endTime = '06:00';
        break;
      default:
        startTime = '09:00';
        endTime = '17:00';
    }

    setFormData(prev => ({
      ...prev,
      type: value,
      startTime,
      endTime,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SelectField
        icon={FaUser}
        label="Employee"
        name="employeeId"
        value={formData.employeeId}
        onChange={handleChange}
        error={errors.employeeId}
        options={[
          { value: '', label: 'Select Employee' },
          ...employees.map(emp => ({
            value: emp.id,
            label: emp.name
          }))
        ]}
      />

      <SelectField
        icon={FaClock}
        label="Shift Type"
        name="type"
        value={formData.type}
        onChange={handleTypeChange}
        error={errors.type}
        options={shiftTypes}
      />

      <InputField
        icon={FaCalendar}
        label="Date"
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        error={errors.date}
      />

      <div className="grid grid-cols-2 gap-4">
        <InputField
          icon={FaClock}
          label="Start Time"
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          error={errors.startTime}
        />

        <InputField
          icon={FaClock}
          label="End Time"
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          error={errors.endTime}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90"
        >
          {shift ? 'Update Shift' : 'Create Shift'}
        </button>
      </div>
    </form>
  );
};

export default ShiftForm; 
