import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (email, password, role) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create initial employee profile
      if (role === 'employee') {
        await setDoc(doc(db, 'employees', userCredential.user.uid), {
          email,
          name: email.split('@')[0],
          role: 'employee',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const googleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Set default role as employee for Google sign-in
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          role: 'employee',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Create initial employee profile
        await setDoc(doc(db, 'employees', result.user.uid), {
          email: result.user.email,
          name: result.user.displayName || result.user.email.split('@')[0],
          role: 'employee',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const logOut = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUser({ 
              ...currentUser, 
              ...userDoc.data(),
              id: currentUser.uid 
            });
          } else {
            // If user document doesn't exist, create it with default role
            await setDoc(doc(db, 'users', currentUser.uid), {
              email: currentUser.email,
              role: 'employee',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            setUser({ 
              ...currentUser, 
              role: 'employee',
              id: currentUser.uid 
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    signUp,
    signIn,
    googleSignIn,
    logOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 