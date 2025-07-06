import { Room, RoomEvent } from 'livekit-client';
import { RetellWebClient } from 'retell-client-js-sdk';
import { TargetAIWebClient } from 'targetai-client-js-sdk';
import { ConnectionDetails, LiveKitVoiceAssistant, RetellVoiceAssistant, TargetAIVoiceAssistant, VoiceAssistantConfig, LiveKitConnectionDetails, RetellConnectionDetails, TargetAIConnectionDetails, GeneralConnectionDetails } from './types';
import { SimpleVoiceAssistant } from './components/SimpleVoiceAssistant';
import { AgentVisualizer } from './components/AgentVisualizer';
import { ControlBar } from './components/ControlBar';
import { LiveKitProvider } from './components/LiveKitProvider';
import { VoiceAssistant } from './components/VoiceAssistant';
import { TranscriptionView } from './components/TranscriptionView';
import { RetellProvider } from './components/RetellProvider';
import { RetellSimpleVoiceAssistant } from './components/RetellSimpleVoiceAssistant';

export class LiveKitVoiceAssistantImpl implements LiveKitVoiceAssistant {
  public room: Room;
  private config: VoiceAssistantConfig;

  constructor(config: VoiceAssistantConfig = {}) {
    this.room = new Room();
    this.config = config;

    if (config.onDeviceFailure) {
      this.room.on(RoomEvent.MediaDevicesError, config.onDeviceFailure);
    }
  }

  public async connect(connectionDetails: LiveKitConnectionDetails): Promise<void> {
    console.log("CONNECTING TO LIVEKIT WITH CONNECTION DETAILS ", connectionDetails);
    await this.room.connect(connectionDetails.serverUrl, connectionDetails.participantToken);
    await this.room.localParticipant.setMicrophoneEnabled(true);
  }

  public disconnect(): void {
    this.room.disconnect();
  }
}

export class RetellVoiceAssistantImpl implements RetellVoiceAssistant {
  public client: RetellWebClient;
  public isCallActive: boolean = false;
  public agentStatus: 'idle' | 'connecting' | 'listening' | 'speaking' = 'idle';
  private config: VoiceAssistantConfig;

  constructor(config: VoiceAssistantConfig = {}) {
    this.config = config;
    this.client = new RetellWebClient();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.client.on('call_started', () => {
      console.log('Retell call started');
      this.agentStatus = 'listening';
      this.isCallActive = true;
      this.config.onCallStarted?.();
    });

    this.client.on('call_ended', () => {
      console.log('Retell call ended');
      this.agentStatus = 'idle';
      this.isCallActive = false;
      this.config.onCallEnded?.();
    });

    this.client.on('agent_start_talking', () => {
      console.log('Retell agent started talking');
      this.agentStatus = 'speaking';
      this.config.onAgentStartTalking?.();
    });

    this.client.on('agent_stop_talking', () => {
      console.log('Retell agent stopped talking');
      this.agentStatus = 'listening';
      this.config.onAgentStopTalking?.();
    });

    this.client.on('error', (error: Error) => {
      console.error('Retell error:', error);
      this.client.stopCall();
      this.isCallActive = false;
      this.agentStatus = 'idle';
      this.config.onError?.(error);
    });
  }

  public async connect(connectionDetails: RetellConnectionDetails): Promise<void> {
    this.agentStatus = 'connecting';
    
    console.log("STARTING RETELL CALL WITH CONNECTION DETAILS ", connectionDetails);
    await this.client.startCall({
      accessToken: connectionDetails.access_token,
      sampleRate: connectionDetails.sample_rate || 24000,
      captureDeviceId: connectionDetails.capture_device_id || 'default',
      emitRawAudioSamples: connectionDetails.emit_raw_audio_samples || false,
    });
  }

  public disconnect(): void {
    if (this.isCallActive) {
      this.client.stopCall();
      this.isCallActive = false;
      this.agentStatus = 'idle';
    }
  }
}

export class TargetAIVoiceAssistantImpl implements TargetAIVoiceAssistant {
  public client!: TargetAIWebClient;
  public isCallActive: boolean = false;
  public agentStatus: 'idle' | 'connecting' | 'listening' | 'speaking' = 'idle';
  private config: VoiceAssistantConfig;

  constructor(config: VoiceAssistantConfig = {}) {
    this.config = config;
  }

  private setupEventListeners(): void {
    this.client.on('call_started', () => {
      console.log('TargetAI call started');
      this.agentStatus = 'listening';
      this.isCallActive = true;
      this.config.onCallStarted?.();
    });

    this.client.on('call_ended', () => {
      console.log('TargetAI call ended');
      this.agentStatus = 'idle';
      this.isCallActive = false;
      this.config.onCallEnded?.();
    });

    this.client.on('agent_start_talking', () => {
      console.log('TargetAI agent started talking');
      this.agentStatus = 'speaking';
      this.config.onAgentStartTalking?.();
    });

    this.client.on('agent_stop_talking', () => {
      console.log('TargetAI agent stopped talking');
      this.agentStatus = 'listening';
      this.config.onAgentStopTalking?.();
    });

    this.client.on('error', (error: Error) => {
      console.error('TargetAI error:', error);
      this.client.stopCall();
      this.isCallActive = false;
      this.agentStatus = 'idle';
      this.config.onError?.(error);
    });
  }

  public async connect(connectionDetails: TargetAIConnectionDetails): Promise<void> {
    this.agentStatus = 'connecting';
    console.log("CONNECTING TO TARGETAI WITH CONNECTION DETAILS ", connectionDetails);
    
    this.client = new TargetAIWebClient({
      serverUrl: connectionDetails.serverUrl,
      tokenServerUrl: connectionDetails.tokenServerUrl,
    });
    this.setupEventListeners();
    console.log('connectionDetails in module', connectionDetails);
    console.log('connectionDetails.allowedResponses', connectionDetails.allowedResponses);
    console.log('emitRawAudioSamples', connectionDetails.emitRawAudioSamples);

    try {
      await this.client.startCall({
        tokenPayload: connectionDetails.tokenPayload,
        agentUuid: connectionDetails.agentUuid,
        allowedResponses: connectionDetails.allowedResponses || ['voice'],
        sampleRate: connectionDetails.sampleRate || 24000,
        emitRawAudioSamples: connectionDetails.emitRawAudioSamples || true,
        dataInput: connectionDetails.dataInput || {},
        messages: connectionDetails.messages?.map(msg => ({
          role: msg.role as any,
          content: msg.content
        }),),
      });
      console.log('TargetAI call successfully started');
    } catch (error) {
      console.error('Error starting TargetAI call:', error);
      this.agentStatus = 'idle';
      this.isCallActive = false;
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  public disconnect(): void {
    if (this.isCallActive) {
      this.client.stopCall();
      this.isCallActive = false;
      this.agentStatus = 'idle';
    }
  }
}

export function createLiveKitVoiceAssistant(config?: VoiceAssistantConfig): LiveKitVoiceAssistant {
  return new LiveKitVoiceAssistantImpl(config);
}

export function createRetellVoiceAssistant(config?: VoiceAssistantConfig): RetellVoiceAssistant {
  return new RetellVoiceAssistantImpl(config);
}

export function createTargetAIVoiceAssistant(config?: VoiceAssistantConfig): TargetAIVoiceAssistant {
  return new TargetAIVoiceAssistantImpl(config);
}

export function createVoiceAssistant(provider: 'livekit', config?: VoiceAssistantConfig): LiveKitVoiceAssistant;
export function createVoiceAssistant(provider: 'retell', config?: VoiceAssistantConfig): RetellVoiceAssistant;
export function createVoiceAssistant(provider: 'targetai', config?: VoiceAssistantConfig): TargetAIVoiceAssistant;
export function createVoiceAssistant(provider: string, config?: VoiceAssistantConfig): LiveKitVoiceAssistant | RetellVoiceAssistant | TargetAIVoiceAssistant {
  switch (provider) {
    case 'livekit':
      return createLiveKitVoiceAssistant(config);
    case 'retell':
      return createRetellVoiceAssistant(config);
    case 'targetai':
      return createTargetAIVoiceAssistant(config);
    default:
      throw new Error(`Provider ${provider} is not supported`);
  }
}

// Export types
export type { ConnectionDetails, VoiceAssistantConfig, LiveKitVoiceAssistant, RetellVoiceAssistant, TargetAIVoiceAssistant, LiveKitConnectionDetails, RetellConnectionDetails, TargetAIConnectionDetails, GeneralConnectionDetails };

// Export components
export { SimpleVoiceAssistant, AgentVisualizer, ControlBar, LiveKitProvider, VoiceAssistant, TranscriptionView, RetellProvider, RetellSimpleVoiceAssistant }; 