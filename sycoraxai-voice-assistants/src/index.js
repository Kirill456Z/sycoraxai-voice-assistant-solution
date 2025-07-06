"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetellSimpleVoiceAssistant = exports.RetellProvider = exports.TranscriptionView = exports.VoiceAssistant = exports.LiveKitProvider = exports.ControlBar = exports.AgentVisualizer = exports.SimpleVoiceAssistant = exports.TargetAIVoiceAssistantImpl = exports.RetellVoiceAssistantImpl = exports.LiveKitVoiceAssistantImpl = void 0;
exports.createLiveKitVoiceAssistant = createLiveKitVoiceAssistant;
exports.createRetellVoiceAssistant = createRetellVoiceAssistant;
exports.createTargetAIVoiceAssistant = createTargetAIVoiceAssistant;
exports.createVoiceAssistant = createVoiceAssistant;
const livekit_client_1 = require("livekit-client");
const retell_client_js_sdk_1 = require("retell-client-js-sdk");
const targetai_client_js_sdk_1 = require("targetai-client-js-sdk");
const SimpleVoiceAssistant_1 = require("./components/SimpleVoiceAssistant");
Object.defineProperty(exports, "SimpleVoiceAssistant", { enumerable: true, get: function () { return SimpleVoiceAssistant_1.SimpleVoiceAssistant; } });
const AgentVisualizer_1 = require("./components/AgentVisualizer");
Object.defineProperty(exports, "AgentVisualizer", { enumerable: true, get: function () { return AgentVisualizer_1.AgentVisualizer; } });
const ControlBar_1 = require("./components/ControlBar");
Object.defineProperty(exports, "ControlBar", { enumerable: true, get: function () { return ControlBar_1.ControlBar; } });
const LiveKitProvider_1 = require("./components/LiveKitProvider");
Object.defineProperty(exports, "LiveKitProvider", { enumerable: true, get: function () { return LiveKitProvider_1.LiveKitProvider; } });
const VoiceAssistant_1 = require("./components/VoiceAssistant");
Object.defineProperty(exports, "VoiceAssistant", { enumerable: true, get: function () { return VoiceAssistant_1.VoiceAssistant; } });
const TranscriptionView_1 = require("./components/TranscriptionView");
Object.defineProperty(exports, "TranscriptionView", { enumerable: true, get: function () { return TranscriptionView_1.TranscriptionView; } });
const RetellProvider_1 = require("./components/RetellProvider");
Object.defineProperty(exports, "RetellProvider", { enumerable: true, get: function () { return RetellProvider_1.RetellProvider; } });
const RetellSimpleVoiceAssistant_1 = require("./components/RetellSimpleVoiceAssistant");
Object.defineProperty(exports, "RetellSimpleVoiceAssistant", { enumerable: true, get: function () { return RetellSimpleVoiceAssistant_1.RetellSimpleVoiceAssistant; } });
class LiveKitVoiceAssistantImpl {
    constructor(config = {}) {
        this.room = new livekit_client_1.Room();
        this.config = config;
        if (config.onDeviceFailure) {
            this.room.on(livekit_client_1.RoomEvent.MediaDevicesError, config.onDeviceFailure);
        }
    }
    async connect(connectionDetails) {
        console.log("CONNECTING TO LIVEKIT WITH CONNECTION DETAILS ", connectionDetails);
        await this.room.connect(connectionDetails.serverUrl, connectionDetails.participantToken);
        await this.room.localParticipant.setMicrophoneEnabled(true);
    }
    disconnect() {
        this.room.disconnect();
    }
}
exports.LiveKitVoiceAssistantImpl = LiveKitVoiceAssistantImpl;
class RetellVoiceAssistantImpl {
    constructor(config = {}) {
        this.isCallActive = false;
        this.agentStatus = 'idle';
        this.config = config;
        this.client = new retell_client_js_sdk_1.RetellWebClient();
        this.setupEventListeners();
    }
    setupEventListeners() {
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
        this.client.on('error', (error) => {
            console.error('Retell error:', error);
            this.client.stopCall();
            this.isCallActive = false;
            this.agentStatus = 'idle';
            this.config.onError?.(error);
        });
    }
    async connect(connectionDetails) {
        this.agentStatus = 'connecting';
        console.log("STARTING RETELL CALL WITH CONNECTION DETAILS ", connectionDetails);
        await this.client.startCall({
            accessToken: connectionDetails.access_token,
            sampleRate: connectionDetails.sample_rate || 24000,
            captureDeviceId: connectionDetails.capture_device_id || 'default',
            emitRawAudioSamples: connectionDetails.emit_raw_audio_samples || false,
        });
    }
    disconnect() {
        if (this.isCallActive) {
            this.client.stopCall();
            this.isCallActive = false;
            this.agentStatus = 'idle';
        }
    }
}
exports.RetellVoiceAssistantImpl = RetellVoiceAssistantImpl;
class TargetAIVoiceAssistantImpl {
    constructor(config = {}) {
        this.isCallActive = false;
        this.agentStatus = 'idle';
        this.config = config;
    }
    setupEventListeners() {
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
        this.client.on('error', (error) => {
            console.error('TargetAI error:', error);
            this.client.stopCall();
            this.isCallActive = false;
            this.agentStatus = 'idle';
            this.config.onError?.(error);
        });
    }
    async connect(connectionDetails) {
        this.agentStatus = 'connecting';
        console.log("CONNECTING TO TARGETAI WITH CONNECTION DETAILS ", connectionDetails);
        this.client = new targetai_client_js_sdk_1.TargetAIWebClient({
            serverUrl: connectionDetails.serverUrl,
            tokenServerUrl: connectionDetails.tokenServerUrl,
        });
        this.setupEventListeners();
        console.log('connectionDetails in module', connectionDetails);
        console.log('connectionDetails.allowedResponses', connectionDetails.allowedResponses);
        console.log('emitRawAudioSamples', connectionDetails.emitRawAudioSamples);
        try {
            await this.client.startCall({
                agentUuid: connectionDetails.agentUuid,
                allowedResponses: connectionDetails.allowedResponses || ['text', 'voice'],
                sampleRate: connectionDetails.sampleRate || 24000,
                emitRawAudioSamples: connectionDetails.emitRawAudioSamples || true,
                dataInput: connectionDetails.dataInput || {},
                responseMedium: connectionDetails.response_medium || 'voice',
                messages: connectionDetails.messages?.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
            });
            console.log('TargetAI call successfully started');
        }
        catch (error) {
            console.error('Error starting TargetAI call:', error);
            this.agentStatus = 'idle';
            this.isCallActive = false;
            this.config.onError?.(error);
            throw error;
        }
    }
    disconnect() {
        if (this.isCallActive) {
            this.client.stopCall();
            this.isCallActive = false;
            this.agentStatus = 'idle';
        }
    }
}
exports.TargetAIVoiceAssistantImpl = TargetAIVoiceAssistantImpl;
function createLiveKitVoiceAssistant(config) {
    return new LiveKitVoiceAssistantImpl(config);
}
function createRetellVoiceAssistant(config) {
    return new RetellVoiceAssistantImpl(config);
}
function createTargetAIVoiceAssistant(config) {
    return new TargetAIVoiceAssistantImpl(config);
}
function createVoiceAssistant(provider, config) {
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
