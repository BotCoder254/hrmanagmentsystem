import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaFile, FaFilePdf, FaFileWord, FaFileExcel, FaImage, FaTrash } from 'react-icons/fa';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const DocumentUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FaFilePdf className="w-8 h-8 text-red-500" />;
    if (type.includes('word') || type.includes('doc')) return <FaFileWord className="w-8 h-8 text-blue-500" />;
    if (type.includes('sheet') || type.includes('excel')) return <FaFileExcel className="w-8 h-8 text-green-500" />;
    if (type.includes('image')) return <FaImage className="w-8 h-8 text-purple-500" />;
    return <FaFile className="w-8 h-8 text-gray-500" />;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    // Validate file types and size
    const validFiles = newFiles.filter(file => {
      const isValidType = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif'
      ].includes(file.type);

      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

      if (!isValidType) {
        alert(`File type not supported: ${file.name}`);
      }
      if (!isValidSize) {
        alert(`File too large (max 10MB): ${file.name}`);
      }

      return isValidType && isValidSize;
    });

    setFiles((prevFiles) => [...prevFiles, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  const uploadFile = async (file, index) => {
    const fileRef = ref(storage, `documents/${user.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(prev => ({ ...prev, [index]: progress }));
      },
      (error) => {
        console.error('Upload error:', error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(fileRef);
          await addDoc(collection(db, 'documents'), {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileUrl: downloadURL,
            uploadedBy: user.uid,
            uploaderName: user.displayName || user.email,
            department: user.department || 'Not Specified',
            category: getFileCategory(file.type),
            description: '',
            tags: [],
            status: 'pending',
            reviewedBy: null,
            reviewerName: null,
            reviewDate: null,
            reviewComments: '',
            version: 1,
            isArchived: false,
            expiryDate: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });

          removeFile(index);
        } catch (error) {
          console.error('Error saving document:', error);
        }
      }
    );
  };

  const uploadAllFiles = () => {
    files.forEach((file, index) => uploadFile(file, index));
  };

  const getFileCategory = (fileType) => {
    if (fileType.includes('pdf')) return 'PDF Document';
    if (fileType.includes('word') || fileType.includes('doc')) return 'Word Document';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'Spreadsheet';
    if (fileType.includes('image')) return 'Image';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'Presentation';
    return 'Other';
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          multiple
          className="hidden"
        />
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <FaCloudUploadAlt className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop files here, or click to select files
          </p>
        </motion.div>
      </div>

      <AnimatePresence mode="popLayout">
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {files.map((file, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {uploadProgress[index] !== undefined && (
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress[index]}%` }}
                        className="bg-primary h-2 rounded-full"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={uploadAllFiles}
              className="w-full bg-primary text-white rounded-lg py-2 hover:bg-primary/90 transition-colors"
            >
              Upload All Files
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentUpload; 
