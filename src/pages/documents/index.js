import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import DocumentUpload from '../../components/documents/DocumentUpload';
import DocumentList from '../../components/documents/DocumentList';
import { FaSpinner } from 'react-icons/fa';

const DocumentsPage = ({ isAdmin = false }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    let q;
    if (isAdmin) {
      q = query(collection(db, 'documents'));
    } else {
      q = query(collection(db, 'documents'), where('uploadedBy', '==', user.uid));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const documentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        currentUserId: user.uid
      }));
      setDocuments(documentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin, user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <FaSpinner className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Manage document submissions' : 'Upload and manage your documents'}
          </p>
        </div>

        {!isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h2>
            <DocumentUpload />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isAdmin ? 'All Documents' : 'My Documents'}
          </h2>
          <DocumentList documents={documents} isAdmin={isAdmin} />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DocumentsPage; 