import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBriefcase, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaMoneyBillWave,
  FaClock,
  FaUserGraduate,
  FaCalendar,
  FaList,
  FaCheckSquare,
  FaTags
} from 'react-icons/fa';

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
        } rounded-md focus:outline-none focus:ring-2 ${
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
        } rounded-md focus:outline-none focus:ring-2 ${
          error ? 'focus:ring-red-500' : 'focus:ring-primary'
        } focus:border-primary sm:text-sm`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
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
      <div className="absolute top-3 left-3 pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <textarea
        className={`block w-full pl-10 pr-3 py-2 border ${
          error ? 'border-red-300' : 'border-gray-300'
        } rounded-md focus:outline-none focus:ring-2 ${
          error ? 'focus:ring-red-500' : 'focus:ring-primary'
        } focus:border-primary sm:text-sm`}
        {...props}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const TagInput = ({ icon: Icon, label, error, value, onChange, placeholder, className = '' }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <div className="min-h-[38px] flex flex-wrap gap-2 items-center pl-10 pr-3 py-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
          {value.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="ml-1 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 outline-none text-sm min-w-[120px]"
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

const JobForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    salary: '',
    experience: '',
    education: '',
    requirements: [],
    skills: [],
    benefits: [],
    deadline: '',
    status: 'active',
    ...initialData
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: '',
        department: '',
        location: '',
        type: 'full-time',
        salary: '',
        experience: '',
        education: '',
        requirements: [],
        skills: [],
        benefits: [],
        deadline: '',
        status: 'active',
        ...initialData,
        requirements: Array.isArray(initialData.requirements) ? initialData.requirements : [],
        skills: Array.isArray(initialData.skills) ? initialData.skills : [],
        benefits: Array.isArray(initialData.benefits) ? initialData.benefits : []
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.type) newErrors.type = 'Job type is required';
    if (!formData.deadline) newErrors.deadline = 'Application deadline is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
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
          icon={FaBriefcase}
          label="Job Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
        />
        <InputField
          icon={FaBuilding}
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          error={errors.department}
          required
        />
        <InputField
          icon={FaMapMarkerAlt}
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          error={errors.location}
          required
        />
        <SelectField
          icon={FaBriefcase}
          label="Job Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          error={errors.type}
          options={[
            { value: 'full-time', label: 'Full Time' },
            { value: 'part-time', label: 'Part Time' },
            { value: 'contract', label: 'Contract' },
            { value: 'internship', label: 'Internship' }
          ]}
          required
        />
        <InputField
          icon={FaMoneyBillWave}
          label="Salary Range"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          placeholder="e.g., $50,000 - $70,000"
        />
        <InputField
          icon={FaClock}
          label="Experience Required"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          placeholder="e.g., 2-3 years"
        />
        <InputField
          icon={FaUserGraduate}
          label="Education Required"
          name="education"
          value={formData.education}
          onChange={handleChange}
          placeholder="e.g., Bachelor's Degree"
        />
        <InputField
          icon={FaCalendar}
          label="Application Deadline"
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          error={errors.deadline}
          required
        />
      </div>

      <TagInput
        icon={FaList}
        label="Requirements"
        value={formData.requirements}
        onChange={(requirements) => setFormData(prev => ({ ...prev, requirements }))}
        placeholder="Type and press Enter to add requirements"
      />

      <TagInput
        icon={FaTags}
        label="Required Skills"
        value={formData.skills}
        onChange={(skills) => setFormData(prev => ({ ...prev, skills }))}
        placeholder="Type and press Enter to add skills"
      />

      <TagInput
        icon={FaCheckSquare}
        label="Benefits"
        value={formData.benefits}
        onChange={(benefits) => setFormData(prev => ({ ...prev, benefits }))}
        placeholder="Type and press Enter to add benefits"
      />

      <SelectField
        icon={FaBriefcase}
        label="Status"
        name="status"
        value={formData.status}
        onChange={handleChange}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'draft', label: 'Draft' },
          { value: 'closed', label: 'Closed' }
        ]}
      />

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialData ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </motion.form>
  );
};

export default JobForm; 
