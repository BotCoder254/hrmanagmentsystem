import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaClipboard, FaCalendar, FaTrophy, FaLightbulb, FaChartLine } from 'react-icons/fa';

const InputField = ({ icon: Icon, label, error, className = '', ...props }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        className={`block w-full pl-10 pr-3 py-3 border ${
          error ? 'border-red-300' : 'border-gray-300'
        } rounded-md focus:outline-none focus:ring-2 ${
          error ? 'focus:ring-red-500' : 'focus:ring-primary'
        } focus:border-primary sm:text-sm bg-white`}
        {...props}
      />
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
        className={`block w-full pl-10 pr-3 py-3 border ${
          error ? 'border-red-300' : 'border-gray-300'
        } rounded-md focus:outline-none focus:ring-2 ${
          error ? 'focus:ring-red-500' : 'focus:ring-primary'
        } focus:border-primary sm:text-sm min-h-[120px] resize-y bg-white`}
        {...props}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const PerformanceForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    reviewDate: new Date().toISOString().split('T')[0],
    keyAchievements: '',
    areasForImprovement: '',
    goals: '',
    additionalComments: '',
    communicationScore: 0,
    technicalScore: 0,
    leadershipScore: 0,
    innovationScore: 0,
    ...initialData
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        reviewDate: initialData.reviewDate?.split('T')[0] || new Date().toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.rating) newErrors.rating = 'Rating is required';
    if (!formData.reviewDate) newErrors.reviewDate = 'Review date is required';
    if (!formData.keyAchievements.trim()) newErrors.keyAchievements = 'Key achievements are required';
    if (!formData.areasForImprovement.trim()) newErrors.areasForImprovement = 'Areas for improvement are required';
    if (!formData.goals.trim()) newErrors.goals = 'Goals are required';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData);
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: null }));
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
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <motion.button
                key={value}
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRatingClick(value)}
                className="focus:outline-none"
              >
                <FaStar
                  className={`w-8 h-8 ${
                    value <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                  } transition-colors`}
                />
              </motion.button>
            ))}
          </div>
          {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Communication Skills</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <motion.button
                  key={value}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFormData(prev => ({ ...prev, communicationScore: value }))}
                  className="focus:outline-none"
                >
                  <FaStar
                    className={`w-6 h-6 ${
                      value <= formData.communicationScore ? 'text-yellow-400' : 'text-gray-300'
                    } transition-colors`}
                  />
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <motion.button
                  key={value}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFormData(prev => ({ ...prev, technicalScore: value }))}
                  className="focus:outline-none"
                >
                  <FaStar
                    className={`w-6 h-6 ${
                      value <= formData.technicalScore ? 'text-yellow-400' : 'text-gray-300'
                    } transition-colors`}
                  />
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Leadership</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <motion.button
                  key={value}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFormData(prev => ({ ...prev, leadershipScore: value }))}
                  className="focus:outline-none"
                >
                  <FaStar
                    className={`w-6 h-6 ${
                      value <= formData.leadershipScore ? 'text-yellow-400' : 'text-gray-300'
                    } transition-colors`}
                  />
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Innovation</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <motion.button
                  key={value}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFormData(prev => ({ ...prev, innovationScore: value }))}
                  className="focus:outline-none"
                >
                  <FaStar
                    className={`w-6 h-6 ${
                      value <= formData.innovationScore ? 'text-yellow-400' : 'text-gray-300'
                    } transition-colors`}
                  />
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <InputField
          type="date"
          name="reviewDate"
          label="Review Date"
          icon={FaCalendar}
          value={formData.reviewDate}
          onChange={handleChange}
          error={errors.reviewDate}
          required
        />

        <TextArea
          name="keyAchievements"
          label="Key Achievements"
          icon={FaTrophy}
          value={formData.keyAchievements}
          onChange={handleChange}
          error={errors.keyAchievements}
          placeholder="List the employee's key achievements..."
          required
        />

        <TextArea
          name="areasForImprovement"
          label="Areas for Improvement"
          icon={FaLightbulb}
          value={formData.areasForImprovement}
          onChange={handleChange}
          error={errors.areasForImprovement}
          placeholder="Identify areas that need improvement..."
          required
        />

        <TextArea
          name="goals"
          label="Goals and Objectives"
          icon={FaChartLine}
          value={formData.goals}
          onChange={handleChange}
          error={errors.goals}
          placeholder="Set goals and objectives for the next period..."
          required
        />

        <TextArea
          name="additionalComments"
          label="Additional Comments"
          icon={FaClipboard}
          value={formData.additionalComments}
          onChange={handleChange}
          error={errors.additionalComments}
          placeholder="Any additional comments or feedback..."
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
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
          {loading ? 'Saving...' : initialData ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </motion.form>
  );
};

export default PerformanceForm; 
