import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UseCallRecordingProps {
  consultationId: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

export const useCallRecording = ({
  consultationId,
  localStream,
  remoteStream,
}: UseCallRecordingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Combine local and remote streams for recording
  const createCombinedStream = useCallback(() => {
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();

    // Add local audio
    if (localStream) {
      const localSource = audioContext.createMediaStreamSource(localStream);
      localSource.connect(destination);
    }

    // Add remote audio
    if (remoteStream) {
      const remoteSource = audioContext.createMediaStreamSource(remoteStream);
      remoteSource.connect(destination);
    }

    // For video, we'll use a canvas to combine both video streams
    const combinedStream = new MediaStream();

    // Add combined audio track
    destination.stream.getAudioTracks().forEach(track => {
      combinedStream.addTrack(track);
    });

    // Add video tracks (prefer remote, fallback to local)
    const videoTrack = remoteStream?.getVideoTracks()[0] || localStream?.getVideoTracks()[0];
    if (videoTrack) {
      combinedStream.addTrack(videoTrack);
    }

    return combinedStream;
  }, [localStream, remoteStream]);

  // Start recording
  const startRecording = useCallback(() => {
    if (isRecording) return;

    try {
      const combinedStream = createCombinedStream();

      const options: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp9,opus',
      };

      // Fallback for browsers that don't support vp9
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options.mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options.mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options.mimeType = 'audio/webm';
      }

      const mediaRecorder = new MediaRecorder(combinedStream, options);
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await saveRecording();
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      startTimeRef.current = Date.now();
      setIsRecording(true);

      // Update duration every second
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      toast({
        title: 'Recording started',
        description: 'The call is now being recorded.',
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        variant: 'destructive',
        title: 'Recording failed',
        description: 'Could not start recording. Please try again.',
      });
    }
  }, [isRecording, createCombinedStream, toast]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!isRecording || !mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, [isRecording]);

  // Save recording to storage
  const saveRecording = useCallback(async () => {
    if (!user || recordedChunksRef.current.length === 0) return;

    try {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const fileName = `${user.id}/${consultationId}/${Date.now()}.webm`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, blob, {
          contentType: 'video/webm',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Save metadata to database
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

      const { error: dbError } = await supabase
        .from('call_recordings')
        .insert({
          consultation_id: consultationId,
          recorded_by: user.id,
          storage_path: fileName,
          duration_seconds: durationSeconds,
          file_size_bytes: blob.size,
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: 'Recording saved',
        description: `Recording saved successfully (${formatDuration(durationSeconds)})`,
      });

      recordedChunksRef.current = [];
      setRecordingDuration(0);
    } catch (error) {
      console.error('Error saving recording:', error);
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: 'Could not save the recording. Please try again.',
      });
    }
  }, [user, consultationId, toast]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup
  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    setIsRecording(false);
    setRecordingDuration(0);
  }, [isRecording]);

  return {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    cleanup,
    formatDuration,
  };
};
