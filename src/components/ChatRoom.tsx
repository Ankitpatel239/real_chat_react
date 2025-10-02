// ChatRoom.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import ChatMessages from './ChatMessages';
import UserList from './UserList';
import CallInterface from './CallInterface';
import CallHistory from './CallHistory';
import type { RoomState, Message, User, CallData, TypingUser } from '../types';

interface ChatRoomProps {
  roomState: RoomState;
  onLeaveRoom: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomState, onLeaveRoom }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<'video' | 'audio' | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // STUN servers
  const pcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };
 
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Set video element srcObject when streams change
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Initialize socket and listeners
  const initializeSocket = useCallback(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ['websocket', 'polling'],
      timeout: 60000,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 5000
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.emit('join-room', {
      roomCode: roomState.roomCode,
      username: roomState.username
    });

    socket.on('room-joined', (data) => {
      setIsConnected(true);
      setUsers(data.users);
      setMessages(data.messages || []);
      setCallHistory(data.callHistory || []);
      setIsLoading(false);
    });

    socket.on('user-joined', (data) => {
      setUsers(data.users);
      addSystemMessage(`${data.username} joined the room`);
    });

    socket.on('user-left', (data) => {
      setUsers(prev => prev.map(user => user.id === data.userId ? { ...user, isOnline: false } : user));
      addSystemMessage(`${data.username} left the room`);
    });

    socket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('user-typing-start', (data: TypingUser) => {
      setTypingUsers(prev => prev.some(u => u.userId === data.userId) ? prev : [...prev, data]);
    });

    socket.on('user-typing-stop', (data: { userId: string }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    // Signaling events
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('call-ended', handleCallEnded);

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      if (error && (error as any).message) alert((error as any).message);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    return () => {
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('call-ended', handleCallEnded);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomState.roomCode, roomState.username]);

  useEffect(() => {
    const cleanup = initializeSocket();
    return cleanup;
  }, [initializeSocket]);

  const addSystemMessage = useCallback((content: string) => {
    const systemMessage: Message = {
      id: Date.now(),
      user_id: 'system',
      username: 'System',
      message: content,
      message_type: 'system',
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, systemMessage]);
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socketRef.current) {
      socketRef.current.emit('send-message', { message: newMessage.trim() });
      setNewMessage('');
      handleTypingStop();
    }
  };

  const handleTypingStart = () => {
    if (socketRef.current) {
      socketRef.current.emit('typing-start');
      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = window.setTimeout(() => handleTypingStop(), 3000);
    }
  };

  const handleTypingStop = () => {
    if (socketRef.current) {
      socketRef.current.emit('typing-stop');
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  // Create peer connection and immediately add the provided stream tracks
  const createPeerConnection = (stream: MediaStream | null) => {
    const pc = new RTCPeerConnection(pcConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', { candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      // prefer first stream
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        // fallback: build stream from tracks
        const s = new MediaStream();
        event.track && s.addTrack(event.track);
        setRemoteStream(s);
      }
      setIsCallActive(true);
    };

    pc.onconnectionstatechange = () => {
      console.log('PC state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setIsCallActive(true);
      } else if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        endCall();
      }
    };

    // add tracks immediately from provided stream
    if (stream) {
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    }

    return pc;
  };

  // Start a call (video/audio)
  const startCall = async (type: 'video' | 'audio') => {
    if (isInCall) return;
    setIsLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });

      // set local stream (for UI) and create peer with the stream immediately
      setLocalStream(stream);
      setCallType(type);
      setIsInCall(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.onloadedmetadata = () => localVideoRef.current?.play().catch(()=>{});
      }

      const pc = createPeerConnection(stream);
      peerConnectionRef.current = pc;

      // create offer AFTER tracks added
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (socketRef.current) {
        socketRef.current.emit('offer', { offer: offer, callType: type });
        socketRef.current.emit('call-started', { callType: type });
      }

      addSystemMessage(`Started ${type} call`);
      setIsLoading(false);
    } catch (err) {
      console.error('Error starting call:', err);
      alert('Could not access media devices. Please allow camera/mic permissions.');
      setIsLoading(false);
      setIsInCall(false);
      setCallType(null);
    }
  };

  // When receiving an offer
  const handleOffer = async (data: any) => {
    // data: { offer, from, username, callType }
    try {
      if (isInCall) {
        // optionally notify busy
        if (socketRef.current) socketRef.current.emit('call-ended'); // simple reject
        return;
      }

      // get local media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: data.callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });

      setLocalStream(stream);
      setCallType(data.callType || 'audio');
      setIsInCall(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.onloadedmetadata = () => localVideoRef.current?.play().catch(()=>{});
      }

      const pc = createPeerConnection(stream);
      peerConnectionRef.current = pc;

      // set remote description with the incoming offer
      await pc.setRemoteDescription(data.offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (socketRef.current) {
        socketRef.current.emit('answer', { answer });
      }

      addSystemMessage(`Incoming ${data.callType} call from ${data.username}`);
    } catch (err) {
      console.error('Error handling offer:', err);
      endCall();
    }
  };

  const handleAnswer = async (data: any) => {
    try {
      if (peerConnectionRef.current && data.answer) {
        await peerConnectionRef.current.setRemoteDescription(data.answer);
        setIsCallActive(true);
      }
    } catch (err) {
      console.error('Error handling answer:', err);
    }
  };

  const handleIceCandidate = async (data: any) => {
    try {
      if (peerConnectionRef.current && data.candidate) {
        await peerConnectionRef.current.addIceCandidate(data.candidate);
      }
    } catch (err) {
      console.error('Error adding remote ICE candidate:', err);
    }
  };

  // End call (clean up)
  const endCall = useCallback(() => {
    // avoid double cleanup
    if (peerConnectionRef.current) {
      try { peerConnectionRef.current.close(); } catch {}
      peerConnectionRef.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
    }

    setRemoteStream(null);
    setIsInCall(false);
    setIsCallActive(false);
    setCallType(null);

    if (socketRef.current) {
      socketRef.current.emit('end-call');
    }

    addSystemMessage('Call ended');
  }, [localStream, addSystemMessage]);

  const handleCallEnded = useCallback((data?: any) => {
    // Avoid duplicate call end messages
    if (!isInCall) return;

    endCall();
    if (data && data.username) addSystemMessage(`Call was ended by ${data.username}`);
  }, [endCall, addSystemMessage, isInCall]);

  const leaveRoom = () => {
    if (isInCall) endCall();
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    onLeaveRoom();
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className=" flex flex-col ">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Room: {roomState.roomCode}</h1>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {users.filter(u => u.isOnline).length} user{users.filter(u => u.isOnline).length !== 1 ? 's' : ''} online
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {roomState.username}</span>
              <button onClick={leaveRoom} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Leave Room</button>
            </div>
          </div>
          <button type='button' onClick={scrollToTop} className="absolute bottom-4 right-4 cursor-pointer"> 🔝<span className="sr-only">Scroll to top</span></button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 gap-4">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 h-full lg:h-auto">
          <ChatMessages messages={messages} currentUser={roomState.username} typingUsers={typingUsers} />
          <div ref={messagesEndRef} />

          <form onSubmit={sendMessage} className="p-4 border-t border-gray-200" style={{ position: 'sticky', bottom: 0 }}>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <input type="text" value={newMessage}
                onChange={(e) => { setNewMessage(e.target.value); handleTypingStart(); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleTypingStop(); }}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading} autoFocus />
              <button type="submit" disabled={isLoading || !newMessage.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                Send
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 flex flex-col space-y-4">
          <UserList users={users} />
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Call Controls</h3>
            <div className="flex flex-col space-y-3">
              <button onClick={() => startCall('video')} disabled={isInCall || isLoading}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50">
                <span>📹</span>
                <span>{isLoading ? 'Starting...' : 'Video Call'}</span>
              </button>
              <button onClick={() => startCall('audio')} disabled={isInCall || isLoading}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                <span>📞</span>
                <span>{isLoading ? 'Starting...' : 'Audio Call'}</span>
              </button>
              {isInCall && (
                <button onClick={endCall} className="flex items-center justify-center space-x-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700">
                  <span>📴</span><span>End Call</span>
                </button>
              )}
            </div>
          </div>

          <CallHistory callHistory={callHistory} />
        </div>
      </div>

      {/* Call Interface */}
      {isInCall && (
        <CallInterface
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          callType={callType!}
          remoteStream={remoteStream}
          isCallActive={isCallActive}
          onEndCall={endCall}
        />
      )}
    </div>
  );
};

export default ChatRoom;
