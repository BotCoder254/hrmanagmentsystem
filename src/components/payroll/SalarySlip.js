import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FaTimes, FaDownload, FaPrint } from 'react-icons/fa';

const SalarySlip = ({ slip, onClose, onDownload, onPrint }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Salary Slip</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Employee Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Employee Name</h3>
                <p className="mt-1 text-lg text-gray-900">{slip.employeeName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Department</h3>
                <p className="mt-1 text-lg text-gray-900">{slip.department}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Employee ID</h3>
                <p className="mt-1 text-lg text-gray-900">{slip.employeeId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Month</h3>
                <p className="mt-1 text-lg text-gray-900">
                  {format(new Date(slip.month), 'MMMM yyyy')}
                </p>
              </div>
            </div>

            {/* Salary Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Base Salary</h3>
                  <p className="mt-1 text-lg text-gray-900">
                    {formatCurrency(slip.baseSalary)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Bonus</h3>
                  <p className="mt-1 text-lg text-green-600">
                    +{formatCurrency(slip.bonus)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Deductions</h3>
                  <p className="mt-1 text-lg text-red-600">
                    -{formatCurrency(slip.deductions)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Net Salary</h3>
                  <p className="mt-1 text-xl font-bold text-primary">
                    {formatCurrency(slip.netSalary)}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {slip.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="mt-1 text-gray-600">{slip.notes}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPrint}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaPrint />
              Print
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FaDownload />
              Download PDF
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SalarySlip; 
 