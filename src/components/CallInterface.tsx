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

  const MainVideoArea = () => (
    <div className="flex-1 relative rounded-2xl md:rounded-3xl overflow-hidden m-2 md:m-4 mt-16 md:mt-20 mb-24 md:mb-28">
      <div className="w-full h-full bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl md:rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl">
        {callType === 'video' ? (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover transition-all duration-500 ${
                isCallActive ? 'opacity-100' : 'opacity-50 blur-sm'
              }`}
            />
            {!isCallActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-lg md:text-2xl font-light mb-3 md:mb-4">
                    Connecting to user...
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-xl md:text-3xl font-light mb-4 md:mb-6">
                {isCallActive ? 'Audio Call Active' : 'Connecting Audio...'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Local Video PiP */}
      {callType === 'video' && (
        <div
          className={`absolute bottom-4 right-4 w-40 h-24 md:bottom-6 md:right-6 md:w-72 md:h-48 bg-gray-900 rounded-xl md:rounded-2xl border-2 ${
            isVideoOff ? 'border-red-400/50' : 'border-white/20'
          } shadow-2xl overflow-hidden transition-all duration-300`}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${
              isVideoOff ? 'opacity-0' : 'opacity-100'
            } transition-opacity duration-300`}
          />
          {isVideoOff && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl md:text-2xl mb-1 md:mb-2">📹</div>
                <div className="text-white font-medium">Camera Off</div>
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-black/60 text-white text-xs px-2 py-0.5 md:px-3 md:py-1 rounded-full">
            You
          </div>
          {isMuted && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-red-500/80 text-white text-xs px-2 py-0.5 md:px-2 md:py-1 rounded-full">
              🔇 Muted
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 flex items-center justify-center p-2 md:p-4"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative w-full max-w-4xl md:max-w-7xl h-full flex flex-col backdrop-blur-sm bg-white/5 rounded-xl md:rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <MainVideoArea />
      </div>
    </div>
  );
};

export default CallInterface;
