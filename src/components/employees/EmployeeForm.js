import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import {
  FaUser, FaEnvelope, FaPhone, FaBuilding,
  FaBriefcase, FaCalendar, FaDollarSign, FaImage,
  FaIdCard, FaGraduationCap, FaMapMarkerAlt,
  FaBirthdayCake, FaVenusMars, FaUserFriends
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

const EmployeeForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    joinDate: '',
    salary: '',
    employeeId: '',
    education: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: '',
    emergencyPhone: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.profileImageUrl || '');
  const [uploadLoading, setUploadLoading] = useState(false);

  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.profileImageUrl || '');
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.position) newErrors.position = 'Position is required';
    if (!formData.joinDate) newErrors.joinDate = 'Join date is required';
    if (!formData.salary) newErrors.salary = 'Salary is required';
    else if (isNaN(formData.salary)) newErrors.salary = 'Salary must be a number';
    if (!formData.employeeId) newErrors.employeeId = 'Employee ID is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.emergencyContact) newErrors.emergencyContact = 'Emergency contact is required';
    if (!formData.emergencyPhone) newErrors.emergencyPhone = 'Emergency contact phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Please upload a valid image file (JPEG, PNG)' }));
      return;
    }

    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
      return;
    }

    setImageFile(file);
    setErrors(prev => ({ ...prev, image: null }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    try {
      setUploadLoading(true);
      const storageRef = ref(storage, `profile-images/${formData.employeeId}-${Date.now()}`);
      await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors(prev => ({ ...prev, image: 'Failed to upload image' }));
      return null;
    } finally {
      setUploadLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      let profileImageUrl = formData.profileImageUrl;
      if (imageFile) {
        profileImageUrl = await uploadImage();
        if (!profileImageUrl) return; // Image upload failed
      }

      await onSubmit({
        ...formData,
        profileImageUrl
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to submit form' }));
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Profile Image Upload */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <FaUser className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          <label
            htmlFor="profileImage"
            className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 disabled:opacity-50"
          >
            <FaImage className="w-4 h-4" />
          </label>
          <input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={uploadLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          id="employeeId"
          name="employeeId"
          type="text"
          label="Employee ID"
          icon={FaIdCard}
          value={formData.employeeId}
          onChange={handleChange}
          error={errors.employeeId}
          required
        />

        <InputField
          id="name"
          name="name"
          type="text"
          label="Full Name"
          icon={FaUser}
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <InputField
          id="email"
          name="email"
          type="email"
          label="Email"
          icon={FaEnvelope}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <InputField
          id="phone"
          name="phone"
          type="tel"
          label="Phone"
          icon={FaPhone}
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          required
        />

        <InputField
          id="department"
          name="department"
          type="text"
          label="Department"
          icon={FaBuilding}
          value={formData.department}
          onChange={handleChange}
          error={errors.department}
          required
        />

        <InputField
          id="position"
          name="position"
          type="text"
          label="Position"
          icon={FaBriefcase}
          value={formData.position}
          onChange={handleChange}
          error={errors.position}
          required
        />

        <InputField
          id="joinDate"
          name="joinDate"
          type="date"
          label="Join Date"
          icon={FaCalendar}
          value={formData.joinDate}
          onChange={handleChange}
          error={errors.joinDate}
          required
        />

        <InputField
          id="salary"
          name="salary"
          type="number"
          label="Salary"
          icon={FaDollarSign}
          value={formData.salary}
          onChange={handleChange}
          error={errors.salary}
          required
        />

        <InputField
          id="education"
          name="education"
          type="text"
          label="Education"
          icon={FaGraduationCap}
          value={formData.education}
          onChange={handleChange}
          error={errors.education}
        />

        <InputField
          id="address"
          name="address"
          type="text"
          label="Address"
          icon={FaMapMarkerAlt}
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
        />

        <InputField
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          label="Date of Birth"
          icon={FaBirthdayCake}
          value={formData.dateOfBirth}
          onChange={handleChange}
          error={errors.dateOfBirth}
          required
        />

        <SelectField
          id="gender"
          name="gender"
          label="Gender"
          icon={FaVenusMars}
          value={formData.gender}
          onChange={handleChange}
          error={errors.gender}
          options={genderOptions}
          required
        />

        <InputField
          id="emergencyContact"
          name="emergencyContact"
          type="text"
          label="Emergency Contact"
          icon={FaUserFriends}
          value={formData.emergencyContact}
          onChange={handleChange}
          error={errors.emergencyContact}
          required
        />

        <InputField
          id="emergencyPhone"
          name="emergencyPhone"
          type="tel"
          label="Emergency Contact Phone"
          icon={FaPhone}
          value={formData.emergencyPhone}
          onChange={handleChange}
          error={errors.emergencyPhone}
          required
        />
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
          disabled={loading || uploadLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {loading || uploadLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </motion.form>
  );
};

export default EmployeeForm; 
