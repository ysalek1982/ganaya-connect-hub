import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { FirebaseUser } from '@/lib/firebase-types';

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

  // NOTE: Firestore rules in your Firebase project currently deny reads/writes,
  // so we avoid blocking login on Firestore during auth bootstrap.
  const buildFallbackUserData = (user: User): FirebaseUser => {
    const email = user.email || '';
    const isAdminEmail = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    return {
      uid: user.uid,
      name: email.split('@')[0] || 'Usuario',
      email,
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
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setState({
          user,
          userData: buildFallbackUserData(user),
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
  }, []);

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
