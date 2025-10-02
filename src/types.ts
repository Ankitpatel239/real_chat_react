export interface User {
  id: string;
  username: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface Message {
  id: number;
  user_id: string;
  username: string;
  message: string;
  message_type: 'text' | 'system';
  created_at: string;
}

export interface CallData {
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidate;
  from: string;
  username?: string;
  callType?: 'video' | 'audio';
}

export interface RoomState {
  roomCode: string;
  userId: string;
  username: string;
  users: User[];
  messages: Message[];
  isConnected: boolean;
  callHistory?: any[];
}

export interface TypingUser {
  userId: string;
  username: string;
}