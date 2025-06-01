import { create } from 'zustand';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  onSnapshot,
  doc,

  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';

export interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  status: 'online' | 'offline';
  lastActive: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: Date;
  read: boolean;
}

type ChatStore = {
  users: UserData[];
  currentChat: UserData | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  
  fetchUsers: (currentUser: User) => void;
  setCurrentChat: (user: UserData | null) => void;
  sendMessage: (text: string, senderId: string, receiverId: string) => Promise<void>;
  clearMessages: () => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  users: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null,
  
  fetchUsers: (currentUser) => {
    set({ loading: true, error: null });
    
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const usersList: UserData[] = [];
        snapshot.forEach((doc) => {
          if (doc.id !== currentUser.uid) {
            const userData = doc.data();
            usersList.push({
              uid: doc.id,
              displayName: userData.displayName,
              email: userData.email,
              photoURL: userData.photoURL,
              status: userData.status,
              lastActive: userData.lastActive?.toDate() || new Date()
            });
          }
        });
        
        set({ users: usersList, loading: false });
      },
      (error) => {
        set({ 
          loading: false, 
          error: error.message 
        });
      }
    );
    
    return unsubscribe;
  },
  
  setCurrentChat: (user) => {
    set({ currentChat: user });
    
    if (user) {
      const { loadMessages } = get() as any;
      loadMessages(user.uid);
    }
  },
  
  loadMessages: (otherUserId: string) => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    
    const userId = JSON.parse(currentUser).uid;
    set({ loading: true, messages: [], error: null });
    
    const q = query(
      collection(db, 'messages'),
      where('users', 'array-contains', userId),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        if ((data.senderId === userId && data.receiverId === otherUserId) || 
            (data.senderId === otherUserId && data.receiverId === userId)) {
          messages.push({
            id: doc.id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            text: data.text,
            createdAt: data.createdAt?.toDate() || new Date(),
            read: data.read
          });
        }
      });
      
      set({ messages, loading: false });
      
      messages.forEach(msg => {
        if (msg.receiverId === userId && !msg.read) {
          updateDoc(doc(db, 'messages', msg.id), { read: true });
        }
      });
    }, (error) => {
      set({ loading: false, error: error.message });
    });
    
    return unsubscribe;
  },
  
  sendMessage: async (text, senderId, receiverId) => {
    try {
      set({ loading: true, error: null });
      
      await addDoc(collection(db, 'messages'), {
        text,
        senderId,
        receiverId,
        users: [senderId, receiverId],
        createdAt: serverTimestamp(),
        read: false
      });
      
      set({ loading: false });
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Error sending message' 
      });
    }
  },
  
  clearMessages: () => {
    set({ messages: [] });
  }
}));