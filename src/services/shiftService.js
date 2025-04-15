import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, onSnapshot } from 'firebase/firestore';

const SHIFTS_COLLECTION = 'shifts';

export const createShift = async (shiftData) => {
  try {
    const docRef = await addDoc(collection(db, SHIFTS_COLLECTION), {
      ...shiftData,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating shift:', error);
    throw error;
  }
};

export const updateShift = async (shiftId, shiftData) => {
  try {
    const shiftRef = doc(db, SHIFTS_COLLECTION, shiftId);
    await updateDoc(shiftRef, {
      ...shiftData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating shift:', error);
    throw error;
  }
};

export const deleteShift = async (shiftId) => {
  try {
    const shiftRef = doc(db, SHIFTS_COLLECTION, shiftId);
    await deleteDoc(shiftRef);
  } catch (error) {
    console.error('Error deleting shift:', error);
    throw error;
  }
};

export const getShiftsByDateRange = async (startDate, endDate) => {
  try {
    const shiftsQuery = query(
      collection(db, SHIFTS_COLLECTION),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    const querySnapshot = await getDocs(shiftsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting shifts:', error);
    throw error;
  }
};

export const subscribeToShifts = (startDate, endDate, callback) => {
  const shiftsQuery = query(
    collection(db, SHIFTS_COLLECTION),
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );

  return onSnapshot(shiftsQuery, (snapshot) => {
    const shifts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(shifts);
  }, (error) => {
    console.error('Error subscribing to shifts:', error);
  });
};

export const getEmployeeShifts = async (employeeId) => {
  try {
    const shiftsQuery = query(
      collection(db, SHIFTS_COLLECTION),
      where('employeeId', '==', employeeId)
    );
    const querySnapshot = await getDocs(shiftsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting employee shifts:', error);
    throw error;
  }
};

export const subscribeToEmployeeShifts = (employeeId, callback) => {
  const shiftsQuery = query(
    collection(db, SHIFTS_COLLECTION),
    where('employeeId', '==', employeeId)
  );

  return onSnapshot(shiftsQuery, (snapshot) => {
    const shifts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(shifts);
  }, (error) => {
    console.error('Error subscribing to employee shifts:', error);
  });
};

export const getEmployees = async () => {
  try {
    const employeesQuery = query(collection(db, 'employees'));
    const querySnapshot = await getDocs(employeesQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting employees:', error);
    throw error;
  }
}; 