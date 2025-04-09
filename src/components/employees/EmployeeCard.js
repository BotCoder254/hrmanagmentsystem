import { motion } from 'framer-motion';
import { 
  FaEnvelope, FaPhone, FaBuilding, FaBriefcase, 
  FaCalendar, FaDollarSign, FaIdCard, FaGraduationCap,
  FaMapMarkerAlt, FaBirthdayCake, FaVenusMars, FaUser,
  FaEdit, FaTrash
} from 'react-icons/fa';

const EmployeeCard = ({ employee, onEdit, onDelete, isAdmin }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(salary);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {/* Profile Header */}
      <div className="relative">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
            {employee.profileImageUrl ? (
              <img
                src={employee.profileImageUrl}
                alt={employee.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <FaUser className="w-12 h-12 text-primary" />
              </div>
            )}
          </div>
        </div>
        <div className="pt-16 pb-4 px-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900">{employee.name}</h3>
          <p className="text-sm text-gray-500">{employee.position}</p>
          <p className="text-xs text-gray-400 mt-1">ID: {employee.employeeId}</p>
        </div>
      </div>

      {/* Employee Details */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <FaEnvelope className="text-gray-400" />
            <span className="text-sm text-gray-600">{employee.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaPhone className="text-gray-400" />
            <span className="text-sm text-gray-600">{employee.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaBuilding className="text-gray-400" />
            <span className="text-sm text-gray-600">{employee.department}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaBriefcase className="text-gray-400" />
            <span className="text-sm text-gray-600">{employee.position}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaCalendar className="text-gray-400" />
            <span className="text-sm text-gray-600">Joined {formatDate(employee.joinDate)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaBirthdayCake className="text-gray-400" />
            <span className="text-sm text-gray-600">{formatDate(employee.dateOfBirth)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaVenusMars className="text-gray-400" />
            <span className="text-sm text-gray-600 capitalize">{employee.gender}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaGraduationCap className="text-gray-400" />
            <span className="text-sm text-gray-600">{employee.education}</span>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <FaUser className="text-gray-400" />
              <span className="text-sm text-gray-600">{employee.emergencyContact}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaPhone className="text-gray-400" />
              <span className="text-sm text-gray-600">{employee.emergencyPhone}</span>
            </div>
          </div>
        </div>

        {/* Address */}
        {employee.address && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <FaMapMarkerAlt className="text-gray-400" />
              <span className="text-sm text-gray-600">{employee.address}</span>
            </div>
          </div>
        )}

        {/* Admin Actions */}
        {isAdmin && (
          <div className="pt-4 border-t border-gray-100 flex justify-end space-x-2">
            <button
              onClick={() => onEdit(employee)}
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Edit employee"
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(employee)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Delete employee"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmployeeCard; 
