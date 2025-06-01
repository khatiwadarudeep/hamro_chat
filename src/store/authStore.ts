import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

type AuthStore = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetError: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  
  signUp: async (email, password, displayName) => {
    try {
      set({ isLoading: true, error: null });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName,
        email,
        photoURL: `https://ui-avatars.com/api/?name=${displayName.replace(' ', '+')}&background=random`,
        status: 'online',
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      });
      
      set({ isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred during sign up' 
      });
    }
  },
  
  signIn: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const userRef = doc(db, 'users', userCredential.user.uid);
      await updateDoc(userRef, {
        status: 'online',
        lastActive: serverTimestamp()
      });
      
      set({ isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred during sign in' 
      });
    }
  },
  
  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          status: 'offline',
          lastActive: serverTimestamp()
        });
      }
      
      await firebaseSignOut(auth);
      set({ user: null, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred during sign out' 
      });
    }
  },
  
  resetError: () => set({ error: null })
}));

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName || 'User',
        email: user.email,
        photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`,
        status: 'online',
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      });
    } else {
      await updateDoc(userRef, {
        status: 'online',
        lastActive: serverTimestamp()
      });
    }
  }
  useAuthStore.setState({ user, isLoading: false });
});