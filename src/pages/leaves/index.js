import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import LeaveRequestForm from '../../components/leaves/LeaveRequestForm';
import LeaveRequestsTable from '../../components/leaves/LeaveRequestsTable';
import LeaveAnalytics from '../../components/leaves/LeaveAnalytics';
import { useAuth } from '../../context/AuthContext';

const LeavesPage = ({ isAdmin = false }) => {
  const [requests, setRequests] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let q;
    if (isAdmin) {
      // For admin, just order by createdAt
      q = query(
        collection(db, 'leave_requests'),
        orderBy('createdAt', 'desc')
      );
    } else {
      // For employees, filter by their ID
      q = query(
        collection(db, 'leave_requests'),
        where('employeeId', '==', user.uid)
      );
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const leaveRequests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        startDate: doc.data().startDate || '',
        endDate: doc.data().endDate || ''
      }));

      // Sort requests by start date on the client side
      const sortedRequests = leaveRequests.sort((a, b) => {
        return new Date(b.startDate) - new Date(a.startDate);
      });

      setRequests(sortedRequests);
    });

    return () => unsubscribe();
  }, [user.uid, isAdmin]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const requestData = {
        ...formData,
        employeeId: user.uid,
        employeeName: user.displayName || user.email.split('@')[0],
        employeeEmail: user.email,
        department: user.department || 'Unassigned',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        daysRequested: calculateDays(formData.startDate, formData.endDate),
        year: new Date(formData.startDate).getFullYear(),
        month: new Date(formData.startDate).getMonth() + 1
      };

      if (selectedRequest) {
        await updateDoc(doc(db, 'leave_requests', selectedRequest.id), {
          ...requestData,
          updatedAt: serverTimestamp(),
          previousStatus: selectedRequest.status
        });
      } else {
        await addDoc(collection(db, 'leave_requests'), requestData);
      }
      setIsFormOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error saving leave request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'leave_requests', requestId), {
        status: 'approved',
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
        approverName: user.displayName || user.email,
        approvedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'leave_requests', requestId), {
        status: 'rejected',
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
        rejectorName: user.displayName || user.email,
        rejectedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin 
                ? 'Manage employee leave requests' 
                : 'Submit and track your leave requests'}
            </p>
          </div>
          {!isAdmin && (
            <button
              onClick={() => {
                setSelectedRequest(null);
                setIsFormOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>Request Leave</span>
            </button>
          )}
        </div>

        {/* Analytics Dashboard for Admins */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LeaveAnalytics requests={requests} />
          </motion.div>
        )}

        {isFormOpen && !isAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md m-4"
            >
              <h2 className="text-2xl font-semibold mb-4">
                {selectedRequest ? 'Edit Leave Request' : 'New Leave Request'}
              </h2>
              <LeaveRequestForm
                initialData={selectedRequest}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedRequest(null);
                }}
                loading={loading}
              />
            </motion.div>
          </div>
        )}

        <LeaveRequestsTable
          requests={requests}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={loading}
          isAdmin={isAdmin}
        />
      </div>
    </DashboardLayout>
  );
};

export default LeavesPage; 
