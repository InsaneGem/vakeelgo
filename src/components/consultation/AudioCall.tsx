
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, User, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useCallRecording } from '@/hooks/useCallRecording';
import { useToast } from '@/hooks/use-toast';

interface AudioCallProps {
  isActive: boolean;
  onEnd: () => void;
  participantName: string;
  consultationId: string;
  isInitiatedByMe?: boolean;
  canRecord?: boolean;
}

export const AudioCall = ({
  isActive,
  onEnd,
  participantName,
  consultationId,
  isInitiatedByMe = false,
  canRecord = false,
}: AudioCallProps) => {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false);

  const {
    localStream,
    remoteStream,
    connectionState,
    isConnecting,
    toggleAudio,
    endCall,
    initiateCall,
    joinCall,
  } = useWebRTC({
    consultationId,
    isActive,
    isVideo: false,
    onRemoteStream: (stream) => {
      if (remoteAudioRef.current && stream) {
        remoteAudioRef.current.srcObject = stream;
      }
    },
    onCallEnded: (reason) => {
      if (reason === 'rejected') {
        toast({ title: 'Call declined', description: `${participantName} declined the call.` });
      } else {
        toast({ title: 'Call ended' });
      }
      onEnd();
    },
  });

  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    formatDuration,
    cleanup: cleanupRecording,
  } = useCallRecording({ consultationId, localStream, remoteStream });

  // Auto start the call: caller initiates, receiver joins (after accepting popup)
  useEffect(() => {
    if (!isActive || hasStartedRef.current) return;

    hasStartedRef.current = true;

    if (isInitiatedByMe) {
      initiateCall();
    } else {
      joinCall();
    }

    setIsMuted(true);
    setIsSpeakerOn(false);

  }, [isActive, isInitiatedByMe, initiateCall, joinCall]);

  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
      setIsMuted(true);
    }
  }, [localStream]);

  // Reset start flag when call closes
  useEffect(() => {
    if (!isActive) hasStartedRef.current = false;
  }, [isActive]);

  // Track duration when connected
  useEffect(() => {
    if (connectionState === 'connected') {
      durationIntervalRef.current = setInterval(() => setCallDuration((p) => p + 1), 1000);
    }
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [connectionState]);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // ADD HERE ↓↓↓
  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = true;
      setIsSpeakerOn(false);
    }
  }, [remoteStream]);

  const handleToggleMute = () => setIsMuted(toggleAudio());

  const toggleSpeaker = () => {
    if (remoteAudioRef.current) remoteAudioRef.current.muted = isSpeakerOn;
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleEndCall = async () => {
    if (isRecording) stopRecording();
    cleanupRecording();
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    await endCall();
    onEnd();
  };

  const handleToggleRecording = () => (isRecording ? stopRecording() : startRecording());

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return isMuted ? 'You are muted' : 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'failed':
        return 'Connection failed';
      default:
        return isInitiatedByMe ? 'Calling...' : 'Joining...';
    }
  };

  if (!isActive) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Header */}
      <div className="h-16 px-4 md:px-6 border-b bg-background/95 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full overflow-hidden border bg-muted shrink-0">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(participantName)}&background=random&size=128`}
              alt={participantName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold truncate">{participantName}</h2>
            <p className="text-xs text-muted-foreground">
              {getStatusText()}
            </p>
          </div>
        </div>

        {connectionState === 'connected' && (
          <div className="text-sm font-mono font-semibold text-emerald-600">
            {formatCallDuration(callDuration)}
          </div>
        )}
      </div>

      {/* Center */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-6">
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(participantName)}&background=random&size=256`}
              alt={participantName}
              className="w-full h-full object-cover"
            />
          </div>

          {connectionState === 'connected' && (
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2 truncate max-w-full">
          {participantName}
        </h1>

        <p className="text-muted-foreground text-sm md:text-base">
          Audio Consultation Call
        </p>

        {/* {isRecording && ( */}
        {canRecord && isRecording && (
          <div className="mt-5 flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-600">
            <Circle className="h-3 w-3 fill-current animate-pulse" />
            Recording {formatDuration(recordingDuration)}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="px-4 md:px-6 pb-6 pt-4 border-t bg-background/95 backdrop-blur">
        <div className="flex items-center justify-center gap-3 md:gap-5 flex-wrap">

          <Button
            variant={isMuted ? 'destructive' : 'outline'}
            className="rounded-full w-14 h-14 md:w-16 md:h-16"
            onClick={handleToggleMute}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          {/* <Button
            variant={isRecording ? 'destructive' : 'outline'}
            className="rounded-full w-14 h-14 md:w-16 md:h-16"
            onClick={handleToggleRecording}
          >
            <Circle className={cn('h-6 w-6', isRecording && 'fill-current')} />
          </Button> */}
          {canRecord && (
            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              className="rounded-full w-14 h-14 md:w-16 md:h-16"
              onClick={handleToggleRecording}
            >
              <Circle className={cn('h-6 w-6', isRecording && 'fill-current')} />
            </Button>
          )}

          <Button
            variant="destructive"
            className="rounded-full w-16 h-16 md:w-20 md:h-20 shadow-xl"
            onClick={handleEndCall}
          >
            <PhoneOff className="h-7 w-7 md:h-8 md:w-8" />
          </Button>

          <Button
            variant={!isSpeakerOn ? 'destructive' : 'outline'}
            className="rounded-full w-14 h-14 md:w-16 md:h-16"
            onClick={toggleSpeaker}
          >
            {isSpeakerOn ? (
              <Volume2 className="h-6 w-6" />
            ) : (
              <VolumeX className="h-6 w-6" />
            )}
          </Button>

        </div>
      </div>
    </div>
  );
};
