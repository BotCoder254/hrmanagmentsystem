import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmployeeForm from '../../components/employees/EmployeeForm';
import EmployeeCard from '../../components/employees/EmployeeCard';
import { useAuth } from '../../context/AuthContext';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const q = query(collection(db, 'employees'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const employeesData = [];
      querySnapshot.forEach((doc) => {
        employeesData.push({ id: doc.id, ...doc.data() });
      });
      setEmployees(employeesData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      if (selectedEmployee) {
        await updateDoc(doc(db, 'employees', selectedEmployee.id), formData);
      } else {
        await addDoc(collection(db, 'employees'), formData);
      }
      setIsFormOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Error saving employee:', error);
    }
    setLoading(false);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDelete = async (employee) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteDoc(doc(db, 'employees', employee.id));
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
            <p className="text-gray-600 mt-1">Manage your organization's employees</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setSelectedEmployee(null);
                setIsFormOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>Add Employee</span>
            </button>
          )}
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md m-4"
            >
              <h2 className="text-2xl font-semibold mb-4">
                {selectedEmployee ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <EmployeeForm
                initialData={selectedEmployee}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedEmployee(null);
                }}
                loading={loading}
              />
            </motion.div>
          </div>
        )}

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))}
          {employees.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12 text-gray-500"
            >
              No employees found
            </motion.div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeesPage; 
