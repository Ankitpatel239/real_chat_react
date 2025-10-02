import React, { useEffect, useRef } from 'react';
import { Message, TypingUser } from '../types';

interface ChatMessagesProps {
  messages: Message[];
  currentUser: string;
  typingUsers: TypingUser[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, currentUser, typingUsers }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const shouldShowDate = (currentMsg: Message, previousMsg?: Message) => {
    if (!previousMsg) return true;
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const previousDate = new Date(previousMsg.created_at).toDateString();
    return currentDate !== previousDate;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(100vh - 60px)' }}>
      {messages.map((message, index) => {
      const previousMessage = messages[index - 1];
      const showDate = shouldShowDate(message, previousMessage);

      return (
        <div key={message.id}>
        {showDate && (
          <div className="flex justify-center my-4">
          <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
            {formatDate(message.created_at)}
          </div>
          </div>
        )}
        
        <div
          className={`flex ${
          message.user_id === 'system' 
            ? 'justify-center'
            : message.user_id === currentUser 
            ? 'justify-end' 
            : 'justify-start'
          }`}
        >
          <div
          className={`max-w-[80%] md:max-w-[60%] px-4 py-2 rounded-2xl ${
            message.user_id === 'system'
            ? 'bg-gray-100 text-gray-600 text-center text-sm'
            : message.user_id === currentUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-900'
          }`}
          >
          {message.user_id !== 'system' && message.user_id !== currentUser && (
            <div className="font-medium text-sm text-gray-700 mb-1">
            {message.username}
            </div>
          )}
          <div className="break-words">{message.message}</div>
          <div
            className={`text-xs mt-1 ${
            message.user_id === currentUser ? 'text-blue-200' : 'text-gray-500'
            }`}
          >
            {formatTime(message.created_at)}
          </div>
          </div>
        </div>
        </div>
      );
      })}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
      <div className="flex justify-start">
        <div className="max-w-[80%] md:max-w-[60%] px-4 py-2 rounded-2xl bg-gray-200 text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-sm">
          {typingUsers.map(user => user.username).join(', ')} 
          {typingUsers.length === 1 ? ' is' : ' are'} typing...
          </span>
        </div>
        </div>
      </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;