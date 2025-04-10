import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import AttendanceMarker from '../../components/attendance/AttendanceMarker';
import AttendanceCalendar from '../../components/attendance/AttendanceCalendar';
import AttendanceDashboard from '../../components/attendance/AttendanceDashboard';
import { useAuth } from '../../context/AuthContext';

const AttendancePage = ({ isAdmin = false }) => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isAdmin ? 'Attendance Management' : 'My Attendance'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isAdmin
                ? 'Monitor and manage employee attendance'
                : 'Track your attendance and view history'}
            </p>
          </div>
        </div>

        {!isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Attendance Marker */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Mark Attendance
              </h2>
              <AttendanceMarker />
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Overview
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Present Days</p>
                  <p className="text-2xl font-bold text-green-700 mt-1">
                    {/* Add present days count */}
                    22
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">Absent Days</p>
                  <p className="text-2xl font-bold text-red-700 mt-1">
                    {/* Add absent days count */}
                    3
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Late Arrivals</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">
                    {/* Add late days count */}
                    2
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-600 font-medium">Early Leaves</p>
                  <p className="text-2xl font-bold text-yellow-700 mt-1">
                    {/* Add early leave count */}
                    1
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Calendar View for Employees */}
        {!isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AttendanceCalendar />
          </motion.div>
        )}

        {/* Admin Dashboard */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AttendanceDashboard />
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage; 