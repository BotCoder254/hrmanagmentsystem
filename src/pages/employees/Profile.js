import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmployeeForm from '../../components/employees/EmployeeForm';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // First try to get from employees collection
        const employeeDoc = await getDoc(doc(db, 'employees', user.uid));
        
        if (employeeDoc.exists()) {
          setProfile({ id: employeeDoc.id, ...employeeDoc.data() });
        } else {
          // If not in employees, check users collection
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Create initial employee profile from user data
            const initialProfile = {
              name: userData.name || user.email.split('@')[0],
              email: user.email,
              role: userData.role || 'employee',
              department: '',
              position: '',
              phone: '',
              joinDate: userData.createdAt || new Date().toISOString(),
            };
            
            // Create employee profile
            await setDoc(doc(db, 'employees', user.uid), initialProfile);
            setProfile({ id: user.uid, ...initialProfile });
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'employees', user.uid), formData);
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center space-y-4"
          >
            <FaSpinner className="w-8 h-8 text-primary animate-spin" />
            <p className="text-gray-600">Loading profile...</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-1">View and manage your profile information</p>
        </div>

        {profile && !isEditing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
                <p className="text-gray-500">{profile.position || 'Position not set'}</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1">{profile.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1">{profile.phone || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Department</h3>
                <p className="mt-1">{profile.department || 'Not assigned'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Position</h3>
                <p className="mt-1">{profile.position || 'Not assigned'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Join Date</h3>
                <p className="mt-1">
                  {new Date(profile.joinDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                <p className="mt-1 capitalize">{profile.role}</p>
              </div>
            </div>
          </motion.div>
        ) : isEditing ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <EmployeeForm
              initialData={profile}
              onSubmit={handleSubmit}
              onCancel={() => setIsEditing(false)}
              loading={loading}
            />
          </motion.div>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default Profile; 