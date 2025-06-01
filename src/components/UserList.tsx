import React, { useEffect } from 'react';
import { useChatStore, UserData } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';

interface UserListProps {
  onSelectUser: (user: UserData) => void;
  selectedUser: UserData | null;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser, selectedUser }) => {
  const { user } = useAuthStore();
  const { users, fetchUsers, loading } = useChatStore();

useEffect(() => {
  if (user) {
    fetchUsers(user); 
  }
}, [user, fetchUsers]);


  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="animate-pulse text-gray-500">Loading users...</div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-gray-500 text-center">No users available</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <h2 className="text-lg font-semibold p-4 text-gray-800 border-b">Contacts</h2>
      <ul className="divide-y divide-gray-200">
        {users.map((user) => (
          <li 
            key={user.uid}
            onClick={() => onSelectUser(user)}
            className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
              selectedUser?.uid === user.uid ? 'bg-gray-100' : ''
            }`}
          >
            <div className="relative">
              <img 
                src={user.photoURL} 
                alt={user.displayName} 
                className="w-12 h-12 rounded-full object-cover"
              />
              <span 
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900">{user.displayName}</p>
              <p className="text-sm text-gray-500">
                {user.status === 'online' 
                  ? 'Online' 
                  : `Last seen: ${new Date(user.lastActive).toLocaleDateString()}`
                }
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;