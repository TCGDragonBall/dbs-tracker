import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType, isQuotaError } from './firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, getCountFromServer, collection, onSnapshot } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: any | null;
  error: string | null;
  isQuotaExceeded: boolean;
  quotaErrorMessage: string | null;
  setIsQuotaExceeded: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  profile: null, 
  error: null,
  isQuotaExceeded: false,
  quotaErrorMessage: null,
  setIsQuotaExceeded: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [quotaErrorMessage, setQuotaErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleQuota = (e: any) => {
      setIsQuotaExceeded(true);
      if (e.detail?.originalError) {
        setQuotaErrorMessage(e.detail.originalError);
      }
    };
    window.addEventListener('firestore-quota-exceeded', handleQuota);
    return () => window.removeEventListener('firestore-quota-exceeded', handleQuota);
  }, []);

  useEffect(() => {
    // Safety timeout: If Firebase auth doesn't respond in 8 seconds, force stop loading
    // to allow the app to at least try to render or show errors.
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        console.warn("Firebase Auth response timed out, forcing application start.");
      }
    }, 8000);

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      clearTimeout(safetyTimeout);
      
      try {
        setError(null);
        
        if (authUser) {
          // Set user immediately
          setUser(authUser);
          
          // CRITICAL: We set loading to false BEFORE the potentially hanging profile fetch.
          // This ensures the App doesn't stay stuck on the loading screen if the network is flaky
          // or if the profile document fetch hangs.
          setLoading(false);
          
          if (isQuotaExceeded) return;
          
          const userDocRef = doc(db, 'users', authUser.uid);
          
          if (unsubscribeProfile) {
            unsubscribeProfile();
          }

          unsubscribeProfile = onSnapshot(userDocRef, async (userDoc) => {
            if (!userDoc.exists()) {
              const newProfile = {
                uid: authUser.uid,
                displayName: authUser.displayName || 'Usuario',
                photoURL: authUser.photoURL || '',
                email: authUser.email || '',
                friends: [],
                createdAt: serverTimestamp(),
                hasAcceptedTerms: false // Explicitly set starting state
              };
              
              try {
                await setDoc(userDocRef, newProfile);
                setProfile(newProfile);
              } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, `users/${authUser.uid}`);
                return;
              }

              // Notify admin of new registration (async)
              const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
              const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
              const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

              if (serviceId && templateId && publicKey) {
                emailjs.send(
                  serviceId,
                  templateId,
                  {
                    from_name: 'DBS Tracker System',
                    from_email: 'system@dbstracker.com',
                    message: `Nuevo usuario registrado: ${newProfile.displayName} (${newProfile.email})`,
                    to_email: 'anulix1983@gmail.com',
                    reply_to: newProfile.email,
                  },
                  publicKey
                ).catch(e => console.error("Error sending registration notification:", e));
              }
            } else {
              setProfile(userDoc.data());
            }
          }, (err) => {
            handleFirestoreError(err, OperationType.GET, `users/${authUser.uid}`);
          });
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
          if (unsubscribeProfile) {
            unsubscribeProfile();
            unsubscribeProfile = null;
          }
        }
      } catch (err: any) {
        if (isQuotaError(err) || err?.message === 'Quota exceeded') {
          setIsQuotaExceeded(true);
          setQuotaErrorMessage(err?.message || 'Quota exceeded');
          setError("Límite de tráfico alcanzado. La app usará la caché local si está disponible.");
        } else {
          console.error("Error in Auth State Transition:", err);
          setError(err instanceof Error ? err.message : String(err));
        }
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimeout);
      if (unsubscribeProfile) unsubscribeProfile();
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, profile, error, isQuotaExceeded, quotaErrorMessage, setIsQuotaExceeded }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
