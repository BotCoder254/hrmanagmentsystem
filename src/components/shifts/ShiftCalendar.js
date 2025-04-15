import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek } from 'date-fns';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import * as shiftService from '../../services/shiftService';
import { useAuth } from '../../context/AuthContext';

const ShiftCalendar = ({ employees, isAdmin, onShiftClick }) => {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [shifts, setShifts] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const startDate = weekStart;
    const endDate = addDays(weekStart, 6);

    const unsubscribe = shiftService.subscribeToShifts(startDate, endDate, (newShifts) => {
      setShifts(newShifts);
    });

    return () => unsubscribe();
  }, [weekStart]);

  const handlePrevWeek = () => {
    setWeekStart(date => addDays(date, -7));
  };

  const handleNextWeek = () => {
    setWeekStart(date => addDays(date, 7));
  };

  const getShiftsForDay = (date, employeeId) => {
    return shifts.filter(shift => 
      shift.date.toDate().toDateString() === date.toDateString() &&
      shift.employeeId === employeeId
    );
  };

  const getShiftColor = (shift) => {
    switch (shift.type.toLowerCase()) {
      case 'morning':
        return 'bg-blue-100 text-blue-800 border-blue-800';
      case 'afternoon':
        return 'bg-green-100 text-green-800 border-green-800';
      case 'night':
        return 'bg-purple-100 text-purple-800 border-purple-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-800';
    }
  };

  const getCellClass = (date, employeeId) => {
    const dayShifts = getShiftsForDay(date, employeeId);
    const isToday = date.toDateString() === new Date().toDateString();
    const hasShifts = dayShifts.length > 0;

    return `
      relative h-24 border border-gray-200 p-2 transition-colors
      ${isToday ? 'bg-blue-50' : 'bg-white'}
      ${hasShifts ? 'hover:bg-gray-50' : 'hover:bg-gray-50'}
      ${isAdmin ? 'cursor-pointer' : ''}
    `;
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={handlePrevWeek}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {format(weekStart, 'MMMM d, yyyy')}
        </h2>
        <button
          onClick={handleNextWeek}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {weekDays.map((date, i) => (
              <div
                key={i}
                className="py-2 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
              >
                {format(date, 'EEE MMM d')}
              </div>
            ))}
          </div>

          {/* Employee Rows */}
          {employees.map((employee) => (
            <div key={employee.id} className="grid grid-cols-7">
              {weekDays.map((date, dayIndex) => (
                <div
                  key={`${employee.id}-${dayIndex}`}
                  className={getCellClass(date, employee.id)}
                  onClick={() => isAdmin && onShiftClick({ date, employeeId: employee.id })}
                >
                  <div className="text-xs text-gray-500 mb-1">{employee.name}</div>
                  {getShiftsForDay(date, employee.id).map((shift) => (
                    <motion.div
                      key={shift.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`
                        p-1 mb-1 rounded text-xs border
                        ${getShiftColor(shift)}
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        onShiftClick(shift);
                      }}
                    >
                      {shift.type}
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShiftCalendar;