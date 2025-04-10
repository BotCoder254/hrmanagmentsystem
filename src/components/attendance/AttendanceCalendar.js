import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { FaChevronLeft, FaChevronRight, FaSpinner } from 'react-icons/fa';

const AttendanceCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchMonthlyAttendance();
  }, [currentDate, user]);

  const fetchMonthlyAttendance = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        where('employeeId', '==', user.uid)
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        let date;
        try {
          // Handle different date formats
          if (docData.date?.toDate) {
            date = docData.date.toDate();
          } else if (typeof docData.date === 'string') {
            date = parseISO(docData.date);
          } else if (docData.date instanceof Date) {
            date = docData.date;
          } else {
            date = new Date(docData.date);
          }
        } catch (error) {
          console.error('Error parsing date:', error);
          date = new Date();
        }

        return {
          id: doc.id,
          ...docData,
          date: date,
          checkInTime: docData.checkInTime?.toDate?.() || null,
          checkOutTime: docData.checkOutTime?.toDate?.() || null
        };
      }).filter(record => {
        try {
          return isSameMonth(record.date, currentDate);
        } catch (error) {
          console.error('Error filtering date:', error);
          return false;
        }
      });

      setAttendanceData(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayColor = (day) => {
    try {
      const attendance = attendanceData.find(a => isSameDay(a.date, day));
      if (!attendance) return 'bg-gray-50 text-gray-400';
      
      if (attendance.checkInTime && attendance.checkOutTime) {
        return 'bg-green-100 text-green-800';
      } else if (attendance.checkInTime) {
        return 'bg-yellow-100 text-yellow-800';
      }
      return 'bg-red-100 text-red-800';
    } catch (error) {
      console.error('Error getting day color:', error);
      return 'bg-gray-50 text-gray-400';
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const previousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
  };

  const getMonthlyStats = () => {
    return attendanceData.reduce((acc, curr) => {
      if (curr.checkInTime && curr.checkOutTime) {
        acc.present++;
      } else if (curr.checkInTime) {
        acc.partial++;
      } else {
        acc.absent++;
      }
      return acc;
    }, { present: 0, partial: 0, absent: 0 });
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

  const stats = getMonthlyStats();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Attendance Calendar</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FaChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-lg font-medium">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FaChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => (
              <motion.button
                key={day.toString()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDayClick(day)}
                className={`p-2 rounded-lg text-center ${getDayColor(day)}`}
              >
                {format(day, 'd')}
              </motion.button>
            ))}
          </div>

          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 border-t border-gray-100"
            >
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {format(selectedDay, 'MMMM d, yyyy')}
              </h3>
              {attendanceData.find(a => isSameDay(a.date, selectedDay)) ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Check In: {formatTime(attendanceData.find(a => isSameDay(a.date, selectedDay))?.checkInTime)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Check Out: {formatTime(attendanceData.find(a => isSameDay(a.date, selectedDay))?.checkOutTime)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No attendance record</p>
              )}
            </motion.div>
          )}

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-sm text-green-600 font-medium">Present</p>
              <p className="text-2xl font-bold text-green-700">{stats.present}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-yellow-600 font-medium">Partial</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.partial}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-red-600 font-medium">Absent</p>
              <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceCalendar; 