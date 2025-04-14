import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendar, FaUser, FaUsers, FaBook, FaUpload } from 'react-icons/fa';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';

const InputField = ({ icon: Icon, label, error, className = '', ...props }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        className={`block w-full ${
          Icon ? 'pl-10' : 'pl-3'
        } pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
          error ? 'border-red-500' : ''
        }`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const TextArea = ({ icon: Icon, label, error, className = '', ...props }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute top-3 left-3 pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <textarea
        className={`block w-full ${
          Icon ? 'pl-10' : 'pl-3'
        } pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
          error ? 'border-red-500' : ''
        }`}
        rows={4}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const TrainingForm = ({ initialData, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    instructor: initialData?.instructor || '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
    capacity: initialData?.capacity || '',
    resources: initialData?.resources || []
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.instructor) newErrors.instructor = 'Instructor is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.capacity) newErrors.capacity = 'Capacity is required';
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadResources = async () => {
    const uploadedResources = [];
    for (const file of files) {
      const storageRef = ref(storage, `training-resources/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      uploadedResources.push({
        name: file.name,
        url,
        type: file.type
      });
    }
    return uploadedResources;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const resources = await uploadResources();
      const trainingData = {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        capacity: parseInt(formData.capacity),
        resources: [...(formData.resources || []), ...resources],
        updatedAt: new Date()
      };

      if (initialData?.id) {
        await updateDoc(doc(db, 'trainings', initialData.id), trainingData);
      } else {
        await addDoc(collection(db, 'trainings'), {
          ...trainingData,
          enrolledCount: 0,
          createdAt: new Date()
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving training:', error);
      setErrors({ submit: 'Failed to save training. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 text-red-700 p-3 rounded-lg text-sm"
        >
          {errors.submit}
        </motion.div>
      )}

      <InputField
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Enter training title"
        required
      />

      <TextArea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Enter training description"
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          icon={FaUser}
          label="Instructor"
          name="instructor"
          value={formData.instructor}
          onChange={handleChange}
          error={errors.instructor}
          placeholder="Enter instructor name"
          required
        />

        <InputField
          icon={FaUsers}
          label="Capacity"
          name="capacity"
          type="number"
          min="1"
          value={formData.capacity}
          onChange={handleChange}
          error={errors.capacity}
          placeholder="Enter maximum capacity"
          required
        />

        <InputField
          icon={FaCalendar}
          label="Start Date"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          error={errors.startDate}
          required
        />

        <InputField
          icon={FaCalendar}
          label="End Date"
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleChange}
          error={errors.endDate}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Resources
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
          <div className="space-y-1 text-center">
            <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/90">
                <span>Upload files</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">
              PDF, DOC, or any training materials
            </p>
          </div>
        </div>
        {files.length > 0 && (
          <ul className="mt-4 space-y-2">
            {files.map((file, index) => (
              <li key={index} className="text-sm text-gray-600">
                <FaBook className="inline-block mr-2" />
                {file.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialData ? 'Update Training' : 'Create Training'}
        </button>
      </div>
    </form>
  );
};

export default TrainingForm;
