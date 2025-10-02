import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RoomState } from '../types';

interface JoinRoomProps {
  onJoinRoom: (roomData: RoomState) => void;
}

const JoinRoom: React.FC<JoinRoomProps> = ({ onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim() && username.trim()) {
      setIsLoading(true);
      // Simulate room joining - actual implementation will be in ChatRoom
      setTimeout(() => {
        onJoinRoom({
          roomCode: roomCode.trim(),
          username: username.trim(),
          userId: '', // Will be set by server
          users: [],
          messages: [],
          isConnected: false
        });
        setIsLoading(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            WebRTC Chat
          </h1>
          <p className="text-gray-600">
            Join a room to start chatting, calling, or video calling
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:outline-none"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
              Room Code
            </label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 uppercase focus:outline-none"
              placeholder="Enter room code"
              maxLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Share this code with others to join the same room
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Joining...' : 'Join Room'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Features:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Real-time text chat</li>
            <li>• Audio calls</li>
            <li>• Video calls</li>
            <li>• Multiple users per room</li>
          </ul>
          <div className="text-xs text-blue-500 mt-2">
              {/* privacy-policy link */}
              By joining a room, you agree to our <Link to="/privacy-policy" className="underline">Privacy Policy</Link>. 

          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;