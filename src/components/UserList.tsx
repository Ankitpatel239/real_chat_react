import React from 'react';
import { User } from '../types';

interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Unknown';
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const onlineUsers = users.filter(user => user.isOnline);
  const offlineUsers = users.filter(user => !user.isOnline);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">
        Online Users ({onlineUsers.length})
      </h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {onlineUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">{user.username}</span>
            </div>
            <span className="text-xs text-green-600">Online</span>
          </div>
        ))}
        
        {offlineUsers.length > 0 && (
          <>
            <div className="pt-2 mt-2 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Offline ({offlineUsers.length})
              </h4>
              {offlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg opacity-75"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">{user.username}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatLastSeen(user.lastSeen)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserList;