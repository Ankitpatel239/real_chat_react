import React, { useState } from 'react';
import JoinRoom from './components/JoinRoom';
import ChatRoom from './components/ChatRoom';
import { RoomState } from './types';

function App() {
  const [roomState, setRoomState] = useState<RoomState | null>(null);

  const handleJoinRoom = (roomData: RoomState) => {
    setRoomState(roomData);
  };

  const handleLeaveRoom = () => {
    // Disconnect from camera and audio
    const mediaTracks = navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    mediaTracks.then((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    }).catch((error) => {
      console.error('Error stopping media tracks:', error);
    });

    setRoomState(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!roomState ? (
        <JoinRoom onJoinRoom={handleJoinRoom} />
      ) : (
        <ChatRoom roomState={roomState} onLeaveRoom={handleLeaveRoom} />
      )}
    </div>
  );
}

export default App;