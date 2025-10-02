import React, { useState, useEffect } from 'react';

interface CallInterfaceProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  callType: 'video' | 'audio';
  remoteStream: MediaStream | null;
  isCallActive: boolean;
  onEndCall: () => void;
}

const CallInterface: React.FC<CallInterfaceProps> = ({
  localVideoRef,
  remoteVideoRef,
  callType,
  remoteStream,
  isCallActive,
  onEndCall
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Call timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    // Add actual mute logic here
  };

  const handleVideoToggle = () => {
    setIsVideoOff(!isVideoOff);
    // Add actual video toggle logic here
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 flex items-center justify-center p-4">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-purple-400 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-25 animate-ping"></div>
      </div>

      <div className="relative w-full max-w-7xl h-full flex flex-col backdrop-blur-sm bg-white/5 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Header with call info */}
        <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-center">
          <div className="bg-black/40 backdrop-blur-md text-white px-4 py-3 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isCallActive ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-pulse'}`}></div>
              <span className="font-medium">
                {callType === 'video' ? '📹 Video Call' : '🎙️ Audio Call'}
              </span>
              <span className="text-sm opacity-80">
                {isCallActive ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
          
          {isCallActive && (
            <div className="bg-black/40 backdrop-blur-md text-white px-4 py-3 rounded-2xl border border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="font-mono text-sm">{formatTime(callDuration)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Video/Audio Area */}
        <div className="flex-1 relative rounded-2xl overflow-hidden m-4 mt-20 mb-24">
          {/* Remote Video/Audio */}
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl relative overflow-hidden">
            {callType === 'video' ? (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover transition-all duration-500 ${isCallActive ? 'scale-100 opacity-100' : 'scale-105 opacity-70'}`}
                />
                {!isCallActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
                        <span className="text-4xl">👤</span>
                      </div>
                      <div className="text-2xl font-light mb-2">Connecting...</div>
                      <div className="flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <span className="text-5xl">🎤</span>
                  </div>
                  <div className="text-3xl font-light mb-4">
                    {isCallActive ? 'Audio Call Active' : 'Connecting Audio...'}
                  </div>
                  {isCallActive ? (
                    <div className="flex justify-center space-x-1">
                      <div className="w-1 h-8 bg-green-400 rounded-full animate-wave" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1 h-6 bg-green-400 rounded-full animate-wave" style={{ animationDelay: '100ms' }}></div>
                      <div className="w-1 h-10 bg-green-400 rounded-full animate-wave" style={{ animationDelay: '200ms' }}></div>
                      <div className="w-1 h-7 bg-green-400 rounded-full animate-wave" style={{ animationDelay: '300ms' }}></div>
                      <div className="w-1 h-9 bg-green-400 rounded-full animate-wave" style={{ animationDelay: '400ms' }}></div>
                    </div>
                  ) : (
                    <div className="text-lg opacity-80">Please wait...</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Local Video PiP */}
          {callType === 'video' && (
            <div className={`absolute bottom-6 right-6 w-64 h-48 bg-gray-900 rounded-2xl border-2 border-white/20 shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:border-white/40 ${isVideoOff ? 'opacity-50' : 'opacity-100'}`}>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {isVideoOff && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-lg">Camera Off</span>
                </div>
              )}
              <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                You
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Call Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex justify-center space-x-8">
          {/* Mute Toggle */}
          <button
            onClick={handleMuteToggle}
            className={`flex flex-col items-center space-y-2 transition-all duration-300 ${
              isMuted ? 'text-red-400' : 'text-white'
            }`}
          >
            <div className={`p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
              isMuted 
                ? 'bg-red-500/20 border-red-400/30 shadow-lg shadow-red-500/20' 
                : 'bg-white/10 border-white/20 hover:bg-white/20 hover:scale-110'
            }`}>
              <span className="text-2xl">
                {isMuted ? '🎤' : '🎤'}
              </span>
            </div>
            <span className="text-sm font-medium">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          {/* Video Toggle (only for video calls) */}
          {callType === 'video' && (
            <button
              onClick={handleVideoToggle}
              className={`flex flex-col items-center space-y-2 transition-all duration-300 ${
                isVideoOff ? 'text-red-400' : 'text-white'
              }`}
            >
              <div className={`p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
                isVideoOff 
                  ? 'bg-red-500/20 border-red-400/30 shadow-lg shadow-red-500/20' 
                  : 'bg-white/10 border-white/20 hover:bg-white/20 hover:scale-110'
              }`}>
                <span className="text-2xl">
                  {isVideoOff ? '📹' : '📹'}
                </span>
              </div>
              <span className="text-sm font-medium">{isVideoOff ? 'Camera On' : 'Camera Off'}</span>
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="flex flex-col items-center space-y-2 group"
          >
            <div className="p-5 bg-red-500 rounded-2xl backdrop-blur-md border border-red-400/30 shadow-2xl shadow-red-500/30 transition-all duration-300 hover:scale-110 hover:bg-red-600 hover:shadow-red-500/50 active:scale-95">
              <span className="text-2xl">📞</span>
            </div>
            <span className="text-sm font-medium text-red-400 group-hover:text-red-300 transition-colors">
              End Call
            </span>
          </button>
        </div>

        {/* Connection Quality Indicator */}
        {isCallActive && (
          <div className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-1 h-3 bg-green-400 rounded-full"></div>
                <div className="w-1 h-4 bg-green-400 rounded-full"></div>
                <div className="w-1 h-5 bg-green-400 rounded-full"></div>
                <div className="w-1 h-3 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-2 bg-gray-400 rounded-full"></div>
              </div>
              <span className="text-sm">Good</span>
            </div>
          </div>
        )}
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.5); }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CallInterface;