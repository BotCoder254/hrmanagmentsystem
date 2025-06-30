import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  FaHeading,
  FaAlignLeft,
  FaBullhorn,
  FaImage,
  FaVideo,
  FaPaperclip,
  FaTimes,
  FaExclamationCircle,
  FaClock,
  FaTags,
  FaUsers,
  FaUserPlus,
  FaChevronDown
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
      <div className="absolute top-3 left-3 pointer-events-none">
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

const MediaPreview = ({ file, url, type, onRemove }) => {
  if (type === 'video') {
    return (
      <div className="relative group">
        <video
          src={url}
          className="w-full h-32 object-cover rounded-lg"
          controls
        />
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative group">
      <img
        src={url}
        alt="Preview"
        className="w-full h-32 object-cover rounded-lg"
      />
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const FilePreview = ({ file, onRemove }) => (
  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-2">
      <FaPaperclip className="text-gray-400" />
      <span className="text-sm text-gray-600 truncate">{file.name}</span>
    </div>
    {onRemove && (
      <button
        onClick={onRemove}
        className="p-1 text-red-500 hover:bg-red-50 rounded-full"
      >
        <FaTimes className="w-4 h-4" />
      </button>
    )}
  </div>
);

// Add new MultiSelectField component
const MultiSelectField = ({ icon: Icon, label, error, options, value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = (id) => {
    const newSelected = value.includes(id)
      ? value.filter(item => item !== id)
      : [...value, id];
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map(option => option.id));
    }
  };

  return (
    <div className={`space-y-1 ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div 
          className={`relative rounded-md border ${error ? 'border-red-300' : 'border-gray-300'} cursor-pointer`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="min-h-[42px] flex items-center pl-10 pr-10 py-2">
            {value.length === 0 ? (
              <span className="text-gray-500">Select employees...</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {value.length > 3 ? (
                  <span className="text-sm">{value.length} employees selected</span>
                ) : (
                  options
                    .filter(option => value.includes(option.id))
                    .map(option => (
                      <span 
                        key={option.id} 
                        className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                      >
                        {option.name || option.email}
                      </span>
                    ))
                )}
              </div>
            )}
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <FaChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
          </div>
        </div>
        
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto border border-gray-200">
            <div 
              className="p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
              onClick={handleSelectAll}
            >
              <span className="font-medium text-gray-700">
                {value.length === options.length ? 'Deselect All' : 'Select All'}
              </span>
              <span className="text-xs text-gray-500">
                {value.length} / {options.length}
              </span>
            </div>
            {options.map(option => (
              <div
                key={option.id}
                className={`p-2 cursor-pointer hover:bg-gray-50 ${value.includes(option.id) ? 'bg-primary/5' : ''}`}
                onClick={() => handleToggle(option.id)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value.includes(option.id)}
                    onChange={() => {}}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <div className="ml-2">
                    <div className="text-sm font-medium text-gray-700">
                      {option.name || 'Unnamed'}
                    </div>
                    <div className="text-xs text-gray-500">{option.email}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

const AnnouncementForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    expiryDate: '',
    tags: [],
    files: [],
    existingMedia: [],
    existingAttachments: [],
    targetEmployees: [],
    isGlobal: true,
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [previewFiles, setPreviewFiles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        category: initialData.category || 'general',
        priority: initialData.priority || 'normal',
        expiryDate: initialData.expiryDate || '',
        tags: initialData.tags || [],
        existingMedia: initialData.mediaUrls || [],
        existingAttachments: initialData.attachments || [],
        targetEmployees: initialData.targetEmployees || [],
        isGlobal: initialData.isGlobal !== false,
        files: []
      });
    }
  }, [initialData]);

  // Fetch employees list
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        // Simple query without filters to avoid index requirements
        const q = query(collection(db, 'employees'));
        const snapshot = await getDocs(q);
        const employeeData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEmployees(employeeData);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  const categoryOptions = [
    { value: 'general', label: 'General' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'event', label: 'Event' },
    { value: 'notice', label: 'Notice' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'normal', label: 'Normal Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';
    if (!formData.isGlobal && formData.targetEmployees.length === 0) {
      newErrors.targetEmployees = 'Please select at least one employee';
    }

    const totalFileSize = [...formData.files].reduce((sum, file) => sum + file.size, 0);
    if (totalFileSize > 50 * 1024 * 1024) { // 50MB limit
      newErrors.files = 'Total file size exceeds 50MB';
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

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleTargetEmployeesChange = (selectedIds) => {
    setFormData(prev => ({
      ...prev,
      targetEmployees: selectedIds
    }));
    if (errors.targetEmployees) {
      setErrors(prev => ({ ...prev, targetEmployees: null }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));

    // Generate previews
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewFiles(prev => [...prev, { url: reader.result, type: 'image', file }]);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setPreviewFiles(prev => [...prev, { url, type: 'video', file }]);
      }
    });
  };

  const handleRemoveFile = (fileToRemove) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(f => f !== fileToRemove)
    }));
    setPreviewFiles(prev => prev.filter(p => p.file !== fileToRemove));
  };

  const handleRemoveExistingMedia = (url) => {
    setFormData(prev => ({
      ...prev,
      existingMedia: prev.existingMedia.filter(media => media.url !== url)
    }));
  };

  const handleRemoveExistingAttachment = (url) => {
    setFormData(prev => ({
      ...prev,
      existingAttachments: prev.existingAttachments.filter(att => att.url !== url)
    }));
  };

  const handleTagsChange = (e) => {
    const value = e.target.value;
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting announcement:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to submit announcement' }));
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
      <InputField
        id="title"
        name="title"
        type="text"
        label="Title"
        icon={FaHeading}
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
      />

      <TextArea
        id="content"
        name="content"
        label="Content"
        icon={FaAlignLeft}
        value={formData.content}
        onChange={handleChange}
        error={errors.content}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          id="category"
          name="category"
          label="Category"
          icon={FaBullhorn}
          value={formData.category}
          onChange={handleChange}
          error={errors.category}
          options={categoryOptions}
          required
        />

        <SelectField
          id="priority"
          name="priority"
          label="Priority"
          icon={FaExclamationCircle}
          value={formData.priority}
          onChange={handleChange}
          error={errors.priority}
          options={priorityOptions}
          required
        />

        <InputField
          id="expiryDate"
          name="expiryDate"
          type="datetime-local"
          label="Expiry Date (Optional)"
          icon={FaClock}
          value={formData.expiryDate}
          onChange={handleChange}
        />

        <InputField
          id="tags"
          name="tags"
          type="text"
          label="Tags (comma-separated)"
          icon={FaTags}
          value={formData.tags.join(', ')}
          onChange={handleTagsChange}
          placeholder="news, important, meeting"
        />
      </div>

      {/* Target Audience Section */}
      <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
        <h3 className="font-medium flex items-center gap-2">
          <FaUsers className="text-primary" />
          Target Audience
        </h3>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isGlobal"
            name="isGlobal"
            checked={formData.isGlobal}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="isGlobal" className="text-sm text-gray-700">
            Send to all employees
          </label>
        </div>
        
        {!formData.isGlobal && (
          <MultiSelectField
            icon={FaUserPlus}
            label="Select Employees"
            value={formData.targetEmployees}
            onChange={handleTargetEmployeesChange}
            options={employees}
            error={errors.targetEmployees}
          />
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Media & Attachments</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FaImage className="text-gray-400" />
            <span>Add Media</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {errors.files && (
          <p className="text-red-500 text-xs">{errors.files}</p>
        )}

        {/* Media Previews */}
        {(formData.existingMedia?.length > 0 || previewFiles.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {formData.existingMedia?.map((media, index) => (
              <MediaPreview
                key={`existing-${index}`}
                url={media.url}
                type={media.type}
                onRemove={() => handleRemoveExistingMedia(media.url)}
              />
            ))}
            {previewFiles.map((preview, index) => (
              <MediaPreview
                key={`new-${index}`}
                url={preview.url}
                type={preview.type}
                onRemove={() => handleRemoveFile(preview.file)}
              />
            ))}
          </div>
        )}

        {/* Attachment Previews */}
        {(formData.existingAttachments?.length > 0 || formData.files.some(f => !f.type.startsWith('image/') && !f.type.startsWith('video/'))) && (
          <div className="space-y-2 mt-4">
            {formData.existingAttachments?.map((attachment, index) => (
              <FilePreview
                key={`existing-attachment-${index}`}
                file={attachment}
                onRemove={() => handleRemoveExistingAttachment(attachment.url)}
              />
            ))}
            {formData.files
              .filter(f => !f.type.startsWith('image/') && !f.type.startsWith('video/'))
              .map((file, index) => (
                <FilePreview
                  key={`new-attachment-${index}`}
                  file={file}
                  onRemove={() => handleRemoveFile(file)}
                />
              ))}
          </div>
        )}
      </div>

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
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </motion.form>
  );
};

export default AnnouncementForm; 