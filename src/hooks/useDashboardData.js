import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useDashboardData = (userId, isAdmin = false) => {
  const [data, setData] = useState({
    employeeCount: 0,
    departmentStats: {},
    announcements: [],
    performance: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribers = [];

    const fetchData = async () => {
      try {
        // Announcements subscription
        const announcementsQuery = query(
          collection(db, 'announcements'),
          where('active', '==', true)
        );
        
        const announcementsUnsubscribe = onSnapshot(announcementsQuery, (snapshot) => {
          const announcements = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              timestamp: data.timestamp?.toDate() || new Date(),
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            };
          });
          setData(prev => ({ ...prev, announcements }));
        });
        unsubscribers.push(announcementsUnsubscribe);

        if (isAdmin) {
          // Employee stats subscription for admins
          const employeesQuery = query(collection(db, 'employees'));
          const employeesUnsubscribe = onSnapshot(employeesQuery, (snapshot) => {
            const departments = {};
            snapshot.docs.forEach(doc => {
              const data = doc.data();
              departments[data.department] = (departments[data.department] || 0) + 1;
            });
            
            setData(prev => ({
              ...prev,
              employeeCount: snapshot.size,
              departmentStats: departments
            }));
          });
          unsubscribers.push(employeesUnsubscribe);
        } else {
          // Individual performance subscription for employees
          const performanceQuery = query(
            collection(db, 'performance'),
            where('employeeId', '==', userId)
          );
          
          const performanceUnsubscribe = onSnapshot(performanceQuery, (snapshot) => {
            const performanceData = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                date: data.date || data.timestamp?.toDate()?.toISOString() || new Date().toISOString(),
                timestamp: data.timestamp?.toDate() || new Date(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
              };
            });
            
            setData(prev => ({ ...prev, performance: performanceData }));
          });
          unsubscribers.push(performanceUnsubscribe);

          // Employee profile subscription
          const employeeUnsubscribe = onSnapshot(doc(db, 'employees', userId), (doc) => {
            if (doc.exists()) {
              const employeeData = doc.data();
              setData(prev => ({
                ...prev,
                attendance: employeeData.attendance || {},
                department: employeeData.department
              }));
            }
          });
          unsubscribers.push(employeeUnsubscribe);
        }

        setData(prev => ({ ...prev, loading: false }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data'
        }));
      }
    };

    fetchData();

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [userId, isAdmin]);

  return data;
};

export default useDashboardData; 