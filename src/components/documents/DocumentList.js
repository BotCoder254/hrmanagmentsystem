import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  FaFile, FaFilePdf, FaFileWord, FaFileExcel, FaImage, 
  FaCheck, FaTimes, FaDownload, FaArchive, FaHistory,
  FaSearch, FaFilter, FaSortAmountDown, FaEye
} from 'react-icons/fa';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../../config/firebase';

const DocumentList = ({ documents, isAdmin }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FaFilePdf className="w-6 h-6 text-red-500" />;
    if (type.includes('word') || type.includes('doc')) return <FaFileWord className="w-6 h-6 text-blue-500" />;
    if (type.includes('sheet') || type.includes('excel')) return <FaFileExcel className="w-6 h-6 text-green-500" />;
    if (type.includes('image')) return <FaImage className="w-6 h-6 text-purple-500" />;
    return <FaFile className="w-6 h-6 text-gray-500" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date not available';
    try {
      return format(timestamp.toDate(), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleStatusChange = async (documentId, newStatus) => {
    try {
      const docRef = doc(db, 'documents', documentId);
      await updateDoc(docRef, {
        status: newStatus,
        reviewedBy: isAdmin ? documents[0].currentUserId : null,
        reviewerName: isAdmin ? documents[0].uploaderName : null,
        reviewDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  const handleArchive = async (document) => {
    try {
      const docRef = doc(db, 'documents', document.id);
      await updateDoc(docRef, {
        isArchived: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error archiving document:', error);
    }
  };

  const handleDelete = async (document) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      // Delete from Storage
      const fileRef = ref(storage, document.fileUrl);
      await deleteObject(fileRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'documents', document.id));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const sortDocuments = (a, b) => {
    switch (sortBy) {
      case 'name':
        return a.fileName.localeCompare(b.fileName);
      case 'size':
        return b.fileSize - a.fileSize;
      case 'type':
        return a.category.localeCompare(b.category);
      default:
        // Handle null timestamps for date sorting
        const dateA = a.createdAt ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA;
    }
  };

  const filteredDocuments = documents
    .filter(doc => {
      if (filter === 'all') return true;
      if (filter === 'archived') return doc.isArchived;
      return doc.status === filter && !doc.isArchived;
    })
    .filter(doc => 
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploaderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(sortDocuments);

  const pageCount = Math.ceil(filteredDocuments.length / itemsPerPage);
  const currentDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Documents</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="type">Type</option>
          </select>
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {currentDocuments.map(document => (
            <motion.div
              key={document.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                {getFileIcon(document.fileType)}
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{document.fileName}</h3>
                  <p className="text-xs text-gray-500">
                    Uploaded by {document.uploaderName || 'Unknown'} on{' '}
                    {formatDate(document.createdAt)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(document.status || 'pending')}`}>
                      {document.status || 'pending'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {((document.fileSize || 0) / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isAdmin && document.status === 'pending' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleStatusChange(document.id, 'approved')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                    >
                      <FaCheck className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleStatusChange(document.id, 'rejected')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <FaTimes className="w-4 h-4" />
                    </motion.button>
                  </>
                )}
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-primary hover:bg-primary/10 rounded-full"
                >
                  <FaDownload className="w-4 h-4" />
                </motion.a>
                {!document.isArchived && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleArchive(document)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-full"
                  >
                    <FaArchive className="w-4 h-4" />
                  </motion.button>
                )}
                {isAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(document)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <FaTimes className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === page
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
            disabled={currentPage === pageCount}
            className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentList; 
