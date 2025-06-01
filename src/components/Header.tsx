import React from 'react';
import { MessageSquare, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Header: React.FC = () => {
  const { signOut, user } = useAuthStore();
  
  return (
    <header className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6" />
          <h1 className="text-xl font-bold">HamroChat</h1>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <span className="hidden sm:block text-sm">
              {user.email}
            </span>
            <button 
              onClick={() => signOut()}
              className="p-2 rounded-full hover:bg-primary-700 transition-colors flex items-center"
              title="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;