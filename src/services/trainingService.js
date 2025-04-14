import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  arrayUnion,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Training Functions
export const createTraining = async (trainingData) => {
  try {
    const trainingRef = await addDoc(collection(db, 'trainings'), {
      ...trainingData,
      createdAt: new Date(),
      status: 'upcoming',
      enrolledCount: 0
    });
    return trainingRef.id;
  } catch (error) {
    console.error('Error creating training:', error);
    throw error;
  }
};

export const updateTraining = async (trainingId, trainingData) => {
  try {
    const trainingRef = doc(db, 'trainings', trainingId);
    await updateDoc(trainingRef, {
      ...trainingData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating training:', error);
    throw error;
  }
};

export const deleteTraining = async (trainingId) => {
  try {
    await deleteDoc(doc(db, 'trainings', trainingId));
  } catch (error) {
    console.error('Error deleting training:', error);
    throw error;
  }
};

// Enrollment Functions
export const enrollInTraining = async (trainingId, userId) => {
  try {
    // Check if already enrolled
    const enrollmentsRef = collection(db, 'enrollments');
    const q = query(
      enrollmentsRef,
      where('trainingId', '==', trainingId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error('Already enrolled in this training');
    }

    // Create enrollment
    await addDoc(enrollmentsRef, {
      userId,
      trainingId,
      enrolledAt: new Date(),
      status: 'in_progress',
      progress: []
    });

    // Update training enrolled count
    const trainingRef = doc(db, 'trainings', trainingId);
    await updateDoc(trainingRef, {
      enrolledCount: increment(1)
    });
  } catch (error) {
    console.error('Error enrolling in training:', error);
    throw error;
  }
};

export const updateEnrollmentProgress = async (enrollmentId, moduleId) => {
  try {
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    await updateDoc(enrollmentRef, {
      progress: arrayUnion(moduleId),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating enrollment progress:', error);
    throw error;
  }
};

// Resource Management
export const uploadTrainingResource = async (file, trainingId) => {
  try {
    const storageRef = ref(storage, `training-resources/${trainingId}/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return {
      name: file.name,
      url,
      type: file.type,
      uploadedAt: new Date()
    };
  } catch (error) {
    console.error('Error uploading training resource:', error);
    throw error;
  }
};

// Query Functions
export const getTrainingsByStatus = async (status) => {
  try {
    const q = query(collection(db, 'trainings'), where('status', '==', status));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching trainings by status:', error);
    throw error;
  }
};

export const getUserEnrollments = async (userId) => {
  try {
    const q = query(collection(db, 'enrollments'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    throw error;
  }
};

export const getTrainingEnrollments = async (trainingId) => {
  try {
    const q = query(collection(db, 'enrollments'), where('trainingId', '==', trainingId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching training enrollments:', error);
    throw error;
  }
}; 
