import { create } from 'zustand';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

const useDashboardStore = create((set) => ({
  // Stats
  employeeCount: 0,
  departmentStats: {},
  recentAnnouncements: [],
  performanceMetrics: {},
  
  // Loading states
  loading: {
    stats: false,
    announcements: false,
    performance: false,
  },

  // Error states
  errors: {
    stats: null,
    announcements: null,
    performance: null,
  },

  // Actions
  setLoading: (key, value) =>
    set((state) => ({
      loading: { ...state.loading, [key]: value },
    })),

  setError: (key, value) =>
    set((state) => ({
      errors: { ...state.errors, [key]: value },
    })),

  // Real-time subscriptions
  subscribeToEmployeeStats: () => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const employees = snapshot.docs.filter(doc => doc.data().role === 'employee');
        const departments = {};
        
        employees.forEach(emp => {
          const dept = emp.data().department || 'Unassigned';
          departments[dept] = (departments[dept] || 0) + 1;
        });

        set({
          employeeCount: employees.length,
          departmentStats: departments,
        });
      },
      (error) => {
        set((state) => ({
          errors: { ...state.errors, stats: error.message },
        }));
      }
    );

    return unsubscribe;
  },

  subscribeToAnnouncements: () => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'announcements'),
        where('active', '==', true)
      ),
      (snapshot) => {
        const announcements = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        set({ recentAnnouncements: announcements });
      },
      (error) => {
        set((state) => ({
          errors: { ...state.errors, announcements: error.message },
        }));
      }
    );

    return unsubscribe;
  },

  subscribeToPerformanceMetrics: (userId) => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'performance'),
        where('userId', '==', userId)
      ),
      (snapshot) => {
        const metrics = snapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});

        set({ performanceMetrics: metrics });
      },
      (error) => {
        set((state) => ({
          errors: { ...state.errors, performance: error.message },
        }));
      }
    );

    return unsubscribe;
  },

  // Cleanup
  cleanup: () => {
    set({
      employeeCount: 0,
      departmentStats: {},
      recentAnnouncements: [],
      performanceMetrics: {},
      loading: {
        stats: false,
        announcements: false,
        performance: false,
      },
      errors: {
        stats: null,
        announcements: null,
        performance: null,
      },
    });
  },
}));

export default useDashboardStore; 