import { Room } from 'livekit-client';
import { RetellWebClient } from 'retell-client-js-sdk';
import { TargetAIWebClient } from 'targetai-client-js-sdk';

export interface GeneralConnectionDetails {
  provider: 'livekit' | 'retell' | 'targetai';
  payload: any;
}

export interface LiveKitConnectionDetails {
  serverUrl: string;
  participantToken: string;
  provider: 'livekit';
}

export interface RetellConnectionDetails {
  access_token: string;
  provider: 'retell';
  sample_rate?: number;
  capture_device_id?: string;
  emit_raw_audio_samples?: boolean;
}

export interface TargetAIConnectionDetails {
  serverUrl: string;
  tokenServerUrl: string;
  provider: 'targetai';
  agentUuid: string;
  tokenPayload?: object;
  allowedResponses?: Array<'text' | 'voice'>;
  sampleRate?: number;
  emitRawAudioSamples?: boolean;
  dataInput?: object;
  messages?: Array<{ role: string; content: string }>;
}

export type ConnectionDetails = LiveKitConnectionDetails | RetellConnectionDetails | TargetAIConnectionDetails;

export interface VoiceAssistantConfig {
  onDeviceFailure?: (error: Error) => void;
  onCallStarted?: () => void;
  onCallEnded?: () => void;
  onAgentStartTalking?: () => void;
  onAgentStopTalking?: () => void;
  onError?: (error: Error) => void;
}

export interface LiveKitVoiceAssistant {
  room: Room;
  connect: (connectionDetails: LiveKitConnectionDetails) => Promise<void>;
  disconnect: () => void;
}

export interface RetellVoiceAssistant {
  client: RetellWebClient;
  connect: (connectionDetails: RetellConnectionDetails) => Promise<void>;
  disconnect: () => void;
  isCallActive: boolean;
  agentStatus: 'idle' | 'connecting' | 'listening' | 'speaking';
}

export interface TargetAIVoiceAssistant {
  client: TargetAIWebClient;
  connect: (connectionDetails: TargetAIConnectionDetails) => Promise<void>;
  disconnect: () => void;
  isCallActive: boolean;
  agentStatus: 'idle' | 'connecting' | 'listening' | 'speaking';
}

export type VoiceAssistant = LiveKitVoiceAssistant | RetellVoiceAssistant | TargetAIVoiceAssistant; 