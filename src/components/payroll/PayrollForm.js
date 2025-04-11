import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  FaUser,
  FaBuilding,
  FaDollarSign,
  FaCalendar,
  FaFile,
  FaSpinner,
  FaPercentage,
  FaCalculator
} from 'react-icons/fa';

const InputField = ({ icon: Icon, label, error, className = '', ...props }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        className={`block w-full pl-10 pr-4 py-2 border ${
          error ? 'border-red-300' : 'border-gray-300'
        } rounded-lg focus:ring-2 focus:ring-primary focus:border-primary`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const SelectField = ({ icon: Icon, label, error, options, className = '', ...props }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <select
        className={`block w-full pl-10 pr-4 py-2 border ${
          error ? 'border-red-300' : 'border-gray-300'
        } rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none`}
        {...props}
      >
        <option value="">Select {label}</option>
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

const TextArea = ({ icon: Icon, label, error, className = '', ...props }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute top-3 left-3 text-gray-400">
        <Icon className="h-5 w-5" />
      </div>
      <textarea
        className={`block w-full pl-10 pr-4 py-2 border ${
          error ? 'border-red-300' : 'border-gray-300'
        } rounded-lg focus:ring-2 focus:ring-primary focus:border-primary`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const PayrollForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    department: '',
    month: '',
    baseSalary: '',
    bonus: '0',
    bonusType: 'fixed', // 'fixed' or 'percentage'
    deductions: '0',
    deductionType: 'fixed', // 'fixed' or 'percentage'
    allowances: '0',
    taxRate: '0',
    notes: '',
    ...initialData
  });

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [calculations, setCalculations] = useState({
    grossSalary: 0,
    totalDeductions: 0,
    totalBonus: 0,
    netSalary: 0,
    tax: 0
  });

  // Fetch employees and departments
  useEffect(() => {
    const unsubscribeEmployees = onSnapshot(
      collection(db, 'employees'),
      (snapshot) => {
        const employeesData = snapshot.docs.map(doc => ({
          value: doc.id,
          label: doc.data().name,
          department: doc.data().department,
          baseSalary: doc.data().baseSalary || 0
        }));
        setEmployees(employeesData);
      }
    );

    const unsubscribeDepartments = onSnapshot(
      collection(db, 'departments'),
      (snapshot) => {
        const departmentsData = snapshot.docs.map(doc => ({
          value: doc.data().name,
          label: doc.data().name
        }));
        setDepartments(departmentsData);
      }
    );

    return () => {
      unsubscribeEmployees();
      unsubscribeDepartments();
    };
  }, []);

  // Calculate salary details whenever form data changes
  useEffect(() => {
    calculateSalary();
  }, [formData]);

  const calculateSalary = () => {
    const base = parseFloat(formData.baseSalary) || 0;
    const allowances = parseFloat(formData.allowances) || 0;
    
    // Calculate bonus
    const bonus = formData.bonusType === 'percentage'
      ? base * (parseFloat(formData.bonus) / 100)
      : parseFloat(formData.bonus) || 0;

    // Calculate deductions
    const deductions = formData.deductionType === 'percentage'
      ? base * (parseFloat(formData.deductions) / 100)
      : parseFloat(formData.deductions) || 0;

    const grossSalary = base + allowances + bonus;
    const tax = grossSalary * (parseFloat(formData.taxRate) / 100);
    const totalDeductions = deductions + tax;
    const netSalary = grossSalary - totalDeductions;

    setCalculations({
      grossSalary,
      totalDeductions,
      totalBonus: bonus,
      netSalary,
      tax
    });
  };

  const handleEmployeeSelect = (e) => {
    const employeeId = e.target.value;
    const employee = employees.find(emp => emp.value === employeeId);
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employeeId,
        employeeName: employee.label,
        department: employee.department,
        baseSalary: employee.baseSalary.toString()
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeId) newErrors.employeeId = 'Employee is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.month) newErrors.month = 'Month is required';
    if (!formData.baseSalary) newErrors.baseSalary = 'Base salary is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        ...calculations,
        timestamp: new Date()
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Employee Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          icon={FaUser}
          label="Employee"
          name="employeeId"
          value={formData.employeeId}
          onChange={handleEmployeeSelect}
          error={errors.employeeId}
          options={employees}
        />
        <InputField
          icon={FaBuilding}
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          error={errors.department}
          disabled
        />
      </div>

      {/* Salary Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          icon={FaCalendar}
          label="Month"
          type="month"
          name="month"
          value={formData.month}
          onChange={handleChange}
          error={errors.month}
        />
        <InputField
          icon={FaDollarSign}
          label="Base Salary"
          type="number"
          name="baseSalary"
          value={formData.baseSalary}
          onChange={handleChange}
          error={errors.baseSalary}
        />
        <InputField
          icon={FaDollarSign}
          label="Allowances"
          type="number"
          name="allowances"
          value={formData.allowances}
          onChange={handleChange}
        />
      </div>

      {/* Bonus Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          icon={FaCalculator}
          label="Bonus Type"
          name="bonusType"
          value={formData.bonusType}
          onChange={handleChange}
          options={[
            { value: 'fixed', label: 'Fixed Amount' },
            { value: 'percentage', label: 'Percentage' }
          ]}
        />
        <InputField
          icon={formData.bonusType === 'percentage' ? FaPercentage : FaDollarSign}
          label="Bonus"
          type="number"
          name="bonus"
          value={formData.bonus}
          onChange={handleChange}
          placeholder={formData.bonusType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
        />
        <InputField
          icon={FaPercentage}
          label="Tax Rate"
          type="number"
          name="taxRate"
          value={formData.taxRate}
          onChange={handleChange}
        />
      </div>

      {/* Deductions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          icon={FaCalculator}
          label="Deduction Type"
          name="deductionType"
          value={formData.deductionType}
          onChange={handleChange}
          options={[
            { value: 'fixed', label: 'Fixed Amount' },
            { value: 'percentage', label: 'Percentage' }
          ]}
        />
        <InputField
          icon={formData.deductionType === 'percentage' ? FaPercentage : FaDollarSign}
          label="Deductions"
          type="number"
          name="deductions"
          value={formData.deductions}
          onChange={handleChange}
          placeholder={formData.deductionType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
        />
      </div>

      {/* Calculations Summary */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <h3 className="font-medium text-gray-900">Salary Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Gross Salary</p>
            <p className="text-lg font-medium text-gray-900">
              ${calculations.grossSalary.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Bonus</p>
            <p className="text-lg font-medium text-green-600">
              +${calculations.totalBonus.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Deductions</p>
            <p className="text-lg font-medium text-red-600">
              -${calculations.totalDeductions.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Net Salary</p>
            <p className="text-lg font-medium text-primary">
              ${calculations.netSalary.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <TextArea
        icon={FaFile}
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Additional notes..."
        rows="3"
      />

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Processing...
            </>
          ) : (
            'Generate Payslip'
          )}
        </button>
      </div>
    </form>
  );
};

export default PayrollForm;
