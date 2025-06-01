import React, { useState, useRef, useEffect } from 'react';
import { useChatStore, UserData, Message } from '../store/chatStore';
import { Send, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface ChatWindowProps {
  selectedUser: UserData | null;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedUser, onBack }) => {
  const [message, setMessage] = useState('');
  const { user } = useAuthStore();
  const { messages, sendMessage, loading, error } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user || !selectedUser) return;
    
    await sendMessage(message.trim(), user.uid, selectedUser.uid);
    setMessage('');
  };
  
  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-4">
        <p className="text-gray-500 text-center">Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b shadow-sm p-3 flex items-center">
        <button 
          onClick={onBack} 
          className="md:hidden mr-2 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="flex items-center">
          <div className="relative">
            <img 
              src={selectedUser.photoURL} 
              alt={selectedUser.displayName}
              className="w-10 h-10 rounded-full object-cover" 
            />
            <span 
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                selectedUser.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-900">{selectedUser.displayName}</p>
            <p className="text-xs text-gray-500">
              {selectedUser.status === 'online' ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Send one to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg: Message) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              isOwn={msg.senderId === user?.uid} 
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white border-t p-3">
  {error && (
    <div className="mb-2 text-sm text-red-600">{error}</div>
  )}
  <div className="flex items-center overflow-hidden rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-primary-500">
    <input
      type="text"
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      placeholder="Type a message..."
      className="flex-1 py-2 px-3 focus:outline-none"
    />
    <button
      type="submit"
      disabled={!message.trim() || loading}
      className={`p-2 transition-colors mr-1 ${
        message.trim() && !loading
          ? ' text-primary-600'
          : ' text-gray-500 cursor-not-allowed'
      }`}
    >
      <Send className="h-5 w-5" />
    </button>
  </div>
</form>

    </div>
  );
};

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[75%] rounded-lg py-2 px-4 ${
          isOwn 
            ? 'bg-primary-600 text-white rounded-br-none' 
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <p>{message.text}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;