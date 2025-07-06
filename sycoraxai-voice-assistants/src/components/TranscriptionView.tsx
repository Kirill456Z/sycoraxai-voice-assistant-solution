import React, { useMemo, useRef, useEffect } from 'react';
import { 
  useTrackTranscription, 
  useVoiceAssistant, 
  useLocalParticipant,
  TrackReferenceOrPlaceholder 
} from "@livekit/components-react";
import { Track } from "livekit-client";

interface TranscriptionSegment {
  id: string;
  text: string;
  role: 'assistant' | 'user';
  firstReceivedTime: number;
}

function useLocalMicTrack() {
  const { microphoneTrack, localParticipant } = useLocalParticipant();

  const micTrackRef: TrackReferenceOrPlaceholder = useMemo(() => {
    return {
      participant: localParticipant,
      source: Track.Source.Microphone,
      publication: microphoneTrack,
    };
  }, [localParticipant, microphoneTrack]);

  return micTrackRef;
}

function useCombinedTranscriptions() {
  const { agentTranscriptions } = useVoiceAssistant();

  const micTrackRef = useLocalMicTrack();
  const { segments: userTranscriptions } = useTrackTranscription(micTrackRef);

  const combinedTranscriptions = useMemo(() => {
    return [
      ...agentTranscriptions.map((val) => {
        return { ...val, role: "assistant" as const };
      }),
      ...userTranscriptions.map((val) => {
        return { ...val, role: "user" as const };
      }),
    ].sort((a, b) => a.firstReceivedTime - b.firstReceivedTime);
  }, [agentTranscriptions, userTranscriptions]);

  return combinedTranscriptions;
}

export function TranscriptionView() {
  const combinedTranscriptions = useCombinedTranscriptions();
  const containerRef = useRef<HTMLDivElement>(null);

  // scroll to bottom when new transcription is added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [combinedTranscriptions]);

  return (
    <div className="relative h-[200px] w-[512px] max-w-[90vw] mx-auto">
      {/* Fade-out gradient mask */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[var(--lk-bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--lk-bg)] to-transparent z-10 pointer-events-none" />

      {/* Scrollable content */}
      <div ref={containerRef} className="h-full flex flex-col gap-2 overflow-y-auto px-4 py-8">
        {combinedTranscriptions.map((segment: TranscriptionSegment) => (
          <div
            id={segment.id}
            key={segment.id}
            className={
              segment.role === "assistant"
                ? "p-2 self-start fit-content"
                : "bg-gray-800 rounded-md p-2 self-end fit-content"
            }
          >
            {segment.text}
          </div>
        ))}
      </div>
    </div>
  );
} 