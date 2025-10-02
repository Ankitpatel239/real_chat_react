import React, { useState, useEffect, useRef } from 'react';

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
  const [isHovering, setIsHovering] = useState(false);

  const durationRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isCallActive) {
      durationRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (durationRef.current) {
        clearInterval(durationRef.current);
      }
    };
  }, [isCallActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMuteToggle = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleVideoToggle = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const ParticleBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-full blur-3xl animate-float-reverse"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
      
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}
        />
      ))}
    </div>
  );

  const ConnectionQuality = () => (
    <div className="absolute top-6 right-6 z-10">
      <div className="bg-black/40 backdrop-blur-xl text-white px-4 py-3 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1 h-5 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-1 h-4 bg-green-400/50 rounded-full"></div>
              <div className="w-1 h-3 bg-green-400/30 rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-green-400">Excellent</span>
          </div>
          <div className="w-1 h-1 bg-white/40 rounded-full"></div>
          <div className="text-sm font-mono">{formatTime(callDuration)}</div>
        </div>
      </div>
    </div>
  );

  const CallHeader = () => (
    <div className="absolute top-4 left-4 z-10 md:top-6 md:left-6">
      <div className="bg-black/40 backdrop-blur-xl text-white px-3 py-2 md:px-4 md:py-3 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${
            isCallActive 
              ? 'bg-green-400 shadow-lg shadow-green-400/50 animate-pulse' 
              : 'bg-yellow-400 shadow-lg shadow-yellow-400/50 animate-ping'
          }`}></div>
          <div className="flex items-center space-x-1 md:space-x-2">
            <span className="text-lg md:text-xl">
              {callType === 'video' ? '📹' : '🎙️'}
            </span>
            <span className="font-medium text-sm md:text-base">
              {callType === 'video' ? 'Video Call' : 'Audio Call'}
            </span>
          </div>
          <div className="w-1 h-1 bg-white/40 rounded-full"></div>
          <span className={`text-xs md:text-sm ${isCallActive ? 'text-green-400' : 'text-yellow-400'}`}>
            {isCallActive ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>
    </div>
  );

  const MainVideoArea = () => (
    <div className="flex-1 relative rounded-2xl md:rounded-3xl overflow-hidden m-2 md:m-4 mt-16 md:mt-20 mb-24 md:mb-28">
      <div className="w-full h-full bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl md:rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl">
        {callType === 'video' ? (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover transition-all duration-1000 ${
                isCallActive ? 'scale-100 opacity-100' : 'scale-110 opacity-60 blur-sm'
              }`}
            />
            {!isCallActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-2xl animate-pulse">
                      <span className="text-4xl md:text-5xl">👤</span>
                    </div>
                    <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl animate-ping-slow"></div>
                  </div>
                  <div className="text-lg md:text-2xl font-light mb-3 md:mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Connecting to user...
                  </div>
                  <div className="flex justify-center space-x-1 md:space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="relative mb-6 md:mb-8">
                <div className="w-28 h-28 md:w-40 md:h-40 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <span className="text-5xl md:text-6xl">🎤</span>
                </div>
                <div className="absolute -inset-4 md:-inset-6 bg-green-500/20 rounded-full blur-2xl animate-pulse-slow"></div>
              </div>
              <div className="text-xl md:text-3xl font-light mb-4 md:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {isCallActive ? 'Audio Call Active' : 'Connecting Audio...'}
              </div>
              {isCallActive ? (
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-6 md:w-2 md:h-8 bg-gradient-to-t from-green-400 to-cyan-400 rounded-full animate-wave"
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        height: `${6 + Math.random() * 10}px`
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-sm md:text-lg opacity-80 animate-pulse">Establishing connection...</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Local Video PiP */}
      {callType === 'video' && (
        <div
          className={`absolute bottom-4 right-4 w-40 h-24 md:bottom-6 md:right-6 md:w-72 md:h-48 bg-gray-900 rounded-xl md:rounded-2xl border-2 ${
            isVideoOff ? 'border-red-400/50' : 'border-white/20'
          } shadow-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:border-white/40 backdrop-blur-sm`}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {isVideoOff && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                <div className="text-xl md:text-2xl mb-1 md:mb-2">📹</div>
                <div className="text-white font-medium">Camera Off</div>
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-black/60 text-white text-xs px-2 py-0.5 md:px-3 md:py-1 rounded-full backdrop-blur-sm border border-white/20">
            You
          </div>
          <div className="absolute top-2 left-2 md:top-3 md:left-3 flex space-x-1">
            {isMuted && (
              <div className="bg-red-500/80 text-white text-xs px-2 py-0.5 md:px-2 md:py-1 rounded-full backdrop-blur-sm">
                🔇 Muted
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const CallControls = () => (
    <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex justify-center space-x-4 md:space-x-8">
      {/* Mute Toggle */}
      <div className="flex flex-col items-center space-y-2 md:space-y-3">
        <button
          onClick={handleMuteToggle}
          className={`relative p-4 md:p-5 rounded-xl md:rounded-2xl backdrop-blur-xl border-2 transition-all duration-300 transform hover:scale-110 active:scale-95 ${
            isMuted
              ? 'bg-red-500/20 border-red-400/50 shadow-lg shadow-red-500/30'
              : 'bg-white/10 border-white/30 hover:bg-white/20 hover:shadow-2xl hover:shadow-white/20'
          }`}
        >
          <span className="text-xl md:text-2xl block transform transition-transform duration-300 hover:scale-125">
            {isMuted ? '🔇' : '🎤'}
          </span>
          {!isMuted && (
            <div className="absolute -inset-1 bg-green-500/20 rounded-xl md:rounded-2xl blur-sm animate-pulse"></div>
          )}
        </button>
        <span className={`text-xs md:text-sm font-medium px-2 md:px-3 py-0.5 md:py-1 rounded-full backdrop-blur-sm ${
          isMuted ? 'text-red-400 bg-red-500/20' : 'text-white bg-white/10'
        }`}>
          {isMuted ? 'Muted' : 'Mute'}
        </span>
      </div>

      {/* Video Toggle */}
      {callType === 'video' && (
        <div className="flex flex-col items-center space-y-2 md:space-y-3">
          <button
            onClick={handleVideoToggle}
            className={`relative p-4 md:p-5 rounded-xl md:rounded-2xl backdrop-blur-xl border-2 transition-all duration-300 transform hover:scale-110 active:scale-95 ${
              isVideoOff
                ? 'bg-red-500/20 border-red-400/50 shadow-lg shadow-red-500/30'
                : 'bg-white/10 border-white/30 hover:bg-white/20 hover:shadow-2xl hover:shadow-white/20'
            }`}
          >
            <span className="text-xl md:text-2xl block transform transition-transform duration-300 hover:scale-125">
              {isVideoOff ? '📹' : '📹'}
            </span>
            {!isVideoOff && (
              <div className="absolute -inset-1 bg-blue-500/20 rounded-xl md:rounded-2xl blur-sm animate-pulse"></div>
            )}
          </button>
          <span className={`text-xs md:text-sm font-medium px-2 md:px-3 py-0.5 md:py-1 rounded-full backdrop-blur-sm ${
            isVideoOff ? 'text-red-400 bg-red-500/20' : 'text-white bg-white/10'
          }`}>
            {isVideoOff ? 'Camera Off' : 'Camera On'}
          </span>
        </div>
      )}

      {/* End Call Button */}
      <div className="flex flex-col items-center space-y-2 md:space-y-3">
        <button
          onClick={onEndCall}
          className="relative p-5 md:p-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl md:rounded-2xl backdrop-blur-xl border-2 border-red-400/50 shadow-2xl shadow-red-500/40 transition-all duration-300 transform hover:scale-110 hover:shadow-red-500/60 active:scale-95 group"
        >
          <span className="text-xl md:text-2xl block transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-90">
            📞
          </span>
          <div className="absolute -inset-2 bg-red-500/30 rounded-xl md:rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
        </button>
        <span className="text-xs md:text-sm font-medium text-red-400 px-2 md:px-3 py-0.5 md:py-1 rounded-full backdrop-blur-sm bg-red-500/20">
          End Call
        </span>
      </div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 flex items-center justify-center p-2 md:p-4"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <ParticleBackground />
      
      <div className="relative w-full max-w-4xl md:max-w-7xl h-full flex flex-col backdrop-blur-sm bg-white/5 rounded-xl md:rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <CallHeader />
        <ConnectionQuality />
        <MainVideoArea />
        <CallControls />
      </div>
    </div>
  );
};

export default CallInterface;