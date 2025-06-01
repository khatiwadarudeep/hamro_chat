import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import UserList from '../components/UserList';
import ChatWindow from '../components/ChatWindow';
import { useChatStore, UserData } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';

const Chat: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showChat, setShowChat] = useState(false);
  const { setCurrentChat, clearMessages } = useChatStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSelectUser = (user: UserData) => {
    setSelectedUser(user);
    setCurrentChat(user);
    setShowChat(true);
  };

  const handleBack = () => {
    setShowChat(false);
    clearMessages();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      
      <main className="flex-1 flex overflow-hidden">
        <div className={`hidden md:block md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200`}>
          <UserList onSelectUser={handleSelectUser} selectedUser={selectedUser} />
        </div>
        
        <div className="hidden md:block md:w-2/3 lg:w-3/4">
          <ChatWindow selectedUser={selectedUser} onBack={() => {}} />
        </div>
        
        <div className={`md:hidden w-full ${showChat ? 'hidden' : 'block'}`}>
          <UserList onSelectUser={handleSelectUser} selectedUser={selectedUser} />
        </div>
        
        <div className={`md:hidden w-full ${showChat ? 'block' : 'hidden'}`}>
          <ChatWindow selectedUser={selectedUser} onBack={handleBack} />
        </div>
      </main>
    </div>
  );
};

export default Chat;