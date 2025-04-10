import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FaCheck, FaClock, FaSpinner, FaSignInAlt, FaSignOutAlt, FaUserCheck } from 'react-icons/fa';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const AttendanceMarker = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    checkTodayAttendance();
  }, [user]);

  const checkTodayAttendance = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        where('employeeId', '==', user.uid),
        where('date', '==', today)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        setTodayAttendance({
          id: doc.id,
          ...data,
          checkInTime: data.checkInTime?.toDate?.() || null,
          checkOutTime: data.checkOutTime?.toDate?.() || null
        });
      }
    } catch (error) {
      console.error('Error checking attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (type) => {
    if (!user) return;

    try {
      setLoading(true);
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!todayAttendance) {
        // Create new attendance record
        const attendanceData = {
          employeeId: user.uid,
          employeeName: user.email?.split('@')[0] || 'Unknown',
          date: today,
          checkInTime: type === 'in' ? serverTimestamp() : null,
          checkOutTime: type === 'out' ? serverTimestamp() : null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await addDoc(collection(db, 'attendance'), attendanceData);
      } else {
        // Update existing record
        const attendanceRef = doc(db, 'attendance', todayAttendance.id);
        await updateDoc(attendanceRef, {
          [type === 'in' ? 'checkInTime' : 'checkOutTime']: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      await checkTodayAttendance();
      setShowModal(true);
    } catch (error) {
      console.error('Error marking attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonState = () => {
    if (!todayAttendance) {
      return {
        checkIn: true,
        checkOut: false,
        text: 'Check In'
      };
    }

    return {
      checkIn: !todayAttendance.checkInTime,
      checkOut: !!todayAttendance.checkInTime && !todayAttendance.checkOutTime,
      text: todayAttendance.checkInTime ? 'Check Out' : 'Check In'
    };
  };

  const formatTime = (date) => {
    try {
      if (!date) return 'N/A';
      return format(date instanceof Date ? date : date.toDate(), 'hh:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'N/A';
    }
  };

  const buttonState = getButtonState();

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center">
          <FaSpinner className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => markAttendance('in')}
            disabled={!buttonState.checkIn || loading}
            className={`w-full py-3 rounded-lg font-medium ${
              buttonState.checkIn
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Check In
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => markAttendance('out')}
            disabled={!buttonState.checkOut || loading}
            className={`w-full py-3 rounded-lg font-medium ${
              buttonState.checkOut
                ? 'bg-highlight text-white hover:bg-highlight/90'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Check Out
          </motion.button>
        </div>
      )}

      {todayAttendance && (
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Today's Status</h3>
          <div className="space-y-2 text-sm text-gray-600">
            {todayAttendance.checkInTime && (
              <p>Check In: {formatTime(todayAttendance.checkInTime)}</p>
            )}
            {todayAttendance.checkOutTime && (
              <p>Check Out: {formatTime(todayAttendance.checkOutTime)}</p>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {buttonState.text} Successful
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your attendance has been recorded for {format(new Date(), 'MMMM d, yyyy')}
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-primary text-white rounded-lg py-2 font-medium hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceMarker;