import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import PayrollDashboard from '../../components/payroll/PayrollDashboard';
import SalaryHistory from '../../components/payroll/SalaryHistory';
import { useAuth } from '../../context/AuthContext';

const PayrollPage = ({ isAdmin = false }) => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isAdmin ? 'Payroll Management' : 'My Salary'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin
              ? 'Manage employee salaries and generate payslips'
              : 'View your salary history and download payslips'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isAdmin ? <PayrollDashboard /> : <SalaryHistory />}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default PayrollPage; 
 