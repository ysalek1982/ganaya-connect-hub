import { useState, useEffect, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { FirebaseUser, UserRole } from '@/lib/firebase-types';

// Admin email that gets automatic admin role
const ADMIN_EMAIL = 'ysalek@gmail.com';

interface AuthState {
  user: User | null;
  userData: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

interface UseFirebaseAuth extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isLineLeader: boolean;
  isAgent: boolean;
  agentId: string | null;
}

export const useFirebaseAuth = (): UseFirebaseAuth => {
  const [state, setState] = useState<AuthState>({
    user: null,
    userData: null,
    loading: true,
    error: null,
  });

  // Create or fetch user document from Firestore
  const fetchOrCreateUserData = useCallback(async (user: User): Promise<FirebaseUser | null> => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: user.uid,
          name: data.name || '',
          email: data.email || user.email || '',
          role: data.role as UserRole || 'AGENT',
          country: data.country || '',
          isActive: data.isActive ?? true,
          lineLeaderId: data.lineLeaderId || null,
          canRecruitSubagents: data.canRecruitSubagents ?? false,
          refCode: data.refCode || null,
          referralUrl: data.referralUrl || null,
          whatsapp: data.whatsapp || null,
          city: data.city || null,
          needsPasswordReset: data.needsPasswordReset ?? false,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }
      
      // User document doesn't exist, create it
      const isAdminEmail = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const newUserData: Omit<FirebaseUser, 'createdAt'> & { createdAt: Date } = {
        uid: user.uid,
        name: user.email?.split('@')[0] || 'Usuario',
        email: user.email || '',
        role: isAdminEmail ? 'ADMIN' : 'AGENT',
        country: '',
        isActive: true,
        lineLeaderId: null,
        canRecruitSubagents: false,
        refCode: null,
        referralUrl: null,
        whatsapp: null,
        city: null,
        needsPasswordReset: false,
        createdAt: new Date(),
      };
      
      await setDoc(userDocRef, newUserData);
      console.log(`Created user document for ${user.email} with role: ${newUserData.role}`);
      
      return newUserData;
    } catch (error) {
      console.error('Error fetching/creating user data:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await fetchOrCreateUserData(user);
        setState({
          user,
          userData,
          loading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          userData: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, [fetchOrCreateUserData]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      const errorMessage = mapFirebaseError(error.code);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await createUserWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      const errorMessage = mapFirebaseError(error.code);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  };

  const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
  };

  const role = state.userData?.role;
  
  return {
    ...state,
    signIn,
    signUp,
    signOut,
    isAdmin: role === 'ADMIN',
    isLineLeader: role === 'LINE_LEADER',
    isAgent: role === 'AGENT',
    agentId: state.user?.uid || null,
  };
};

// Map Firebase error codes to user-friendly messages
const mapFirebaseError = (code: string): string => {
  const errorMap: Record<string, string> = {
    'auth/invalid-email': 'El email no es válido',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'No existe una cuenta con este email',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/too-many-requests': 'Demasiados intentos. Espera un momento',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
  };
  return errorMap[code] || 'Error de autenticación';
};

export default useFirebaseAuth;
