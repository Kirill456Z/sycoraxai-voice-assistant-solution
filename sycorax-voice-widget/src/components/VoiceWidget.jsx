import React, { useState, useEffect, useRef } from 'react';
import { createVoiceAssistant } from 'sycoraxai-voice-assistants';
import './VoiceWidget.css';

const VoiceWidget = ({ 
  config = {},
  onStatusChange = () => {},
  onError = () => {},
  className = ''
}) => {
  const [initialized, setInitialized] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);
  const [currentState, setCurrentState] = useState('idle'); // States: idle, loading, listening, thinking, speaking
  const [selectedLanguage, setSelectedLanguage] = useState('ru'); // Default to Russian
  const [assistant, setAssistant] = useState(null);
  const [error, setError] = useState(null);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [buttonText, setButtonText] = useState('');
  const [buttonIcon, setButtonIcon] = useState('📞');
  const [buttonBgColor, setButtonBgColor] = useState('#000');

  const translations = useRef({
    'en': {
      voiceChat: 'VOICE CHAT',
      connecting: 'CONNECTING...',
      listening: 'LISTENING...',
      speaking: 'SPEAKING...',
      endCall: 'END CALL',
      error: 'ERROR',
      unavailable: 'UNAVAILABLE'
    },
    'ru': {
      voiceChat: 'ГОЛОСОВОЙ ЧАТ',
      connecting: 'ПОДКЛЮЧЕНИЕ...',
      listening: 'СЛУШАЮ...',
      speaking: 'ГОВОРЮ...',
      endCall: 'ЗАВЕРШИТЬ',
      error: 'ОШИБКА',
      unavailable: 'НЕДОСТУПНО'
    },
    'es': {
      voiceChat: 'CHAT DE VOZ',
      connecting: 'CONECTANDO...',
      listening: 'ESCUCHANDO...',
      speaking: 'HABLANDO...',
      endCall: 'FINALIZAR',
      error: 'ERROR',
      unavailable: 'NO DISPONIBLE'
    },
  });

  const getTranslation = (key) => {
    return translations.current[selectedLanguage][key] || translations.current['en'][key];
  };

  const handleLanguageButtonClick = (e) => {
    e.stopPropagation();
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    setIsLanguageDropdownOpen(false);
    updateButtonState(currentState);
  };

  const updateButtonState = (state) => {
    setCurrentState(state);
    let newButtonText = '';
    let newButtonIcon = '';
    let newButtonBgColor = '#000';

    switch (state) {
      case 'idle':
        newButtonText = getTranslation('voiceChat');
        newButtonIcon = '📞';
        break;
      case 'connecting':
        newButtonText = getTranslation('connecting');
        newButtonIcon = '🔄';
        newButtonBgColor = '#ffc107';
        break;
      case 'listening':
        newButtonText = getTranslation('listening');
        newButtonIcon = '👂';
        newButtonBgColor = '#2196f3';
        break;
      case 'speaking':
        newButtonText = getTranslation('speaking');
        newButtonIcon = '🗣️';
        newButtonBgColor = '#9c27b0';
        break;
      case 'active': // Call started, ready to end
        newButtonText = getTranslation('endCall');
        newButtonIcon = '📞';
        newButtonBgColor = '#f44336';
        break;
      case 'error':
        newButtonText = getTranslation('error');
        newButtonIcon = '❌';
        newButtonBgColor = '#f44336';
        break;
      case 'unavailable':
        newButtonText = getTranslation('unavailable');
        newButtonIcon = '❌';
        newButtonBgColor = '#f44336';
        break;
      default:
        newButtonText = getTranslation('voiceChat');
        newButtonIcon = '📞';
    }
    
    setButtonText(newButtonText);
    setButtonIcon(newButtonIcon);
    setButtonBgColor(newButtonBgColor);
  };

  const actionButtonRef = useRef(null);
  const languageButtonRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const metallicButtonRef = useRef(null);
  const widgetElRef = useRef(null);
  const assistantRef = useRef(null);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      
      // Set initial button state
      updateButtonState('idle');
      
      // Handle click outside to close dropdown
      const handleClickOutside = (e) => {
        if (widgetElRef.current && !widgetElRef.current.contains(e.target)) {
          setIsLanguageDropdownOpen(false);
        }
      };
      
      document.addEventListener('click', handleClickOutside);

      // Metallic button hover effects
      const handleMouseEnter = () => { if (metallicButtonRef.current) metallicButtonRef.current.style.transform = 'scale(1.05)'; };
      const handleMouseLeave = () => { if (metallicButtonRef.current) metallicButtonRef.current.style.transform = 'scale(1)'; };
      if (metallicButtonRef.current) {
        metallicButtonRef.current.addEventListener('mouseenter', handleMouseEnter);
        metallicButtonRef.current.addEventListener('mouseleave', handleMouseLeave);
      }

      return () => {
        assistantRef.current?.disconnect();
        document.removeEventListener('click', handleClickOutside);
        if (metallicButtonRef.current) {
          metallicButtonRef.current.removeEventListener('mouseenter', handleMouseEnter);
          metallicButtonRef.current.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }
  }, [initialized]);

  // Update button text when language changes
  useEffect(() => {
    if (initialized) {
      updateButtonState(currentState);
    }
  }, [selectedLanguage, initialized]);

  const requestMicrophonePermissionAndStartCall = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicrophonePermission(true);
      startOrRestartCall();
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setError('Microphone permission denied. Please enable it in your browser settings.');
      updateButtonState('error');
    }
  };

  const startOrRestartCall = async () => {
    if (isCallActive) {
      assistantRef.current.disconnect();
    } else {
      try {
        updateButtonState('connecting');
        setError(null);
        
        // Fetch fresh connection details before starting the call
        const connectionDetailsResponse = await fetch(`${config.tokenServerUrl}/connectionDetails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            company_id: config.companyId,
            language: selectedLanguage
          })
        });

        if (!connectionDetailsResponse.ok) {
          throw new Error(`Token request failed: ${connectionDetailsResponse.status}`);
        }

        const connectionDetails = await connectionDetailsResponse.json();
        
        // Update config with fresh connection details
        config.provider = connectionDetails.provider;
        if (config.provider === 'targetai') {
          config.agent_uuid = connectionDetails.agent_uuid;
          config.server_url = connectionDetails.server_url;
          config.messages = connectionDetails.messages;
        } else if (config.provider === 'retell') {
          config.access_token = connectionDetails.access_token;
          config.agentId = connectionDetails.agent_id;
        } else if (config.provider === 'livekit') {
          config.participantToken = connectionDetails.participant_token;
          config.server_url = connectionDetails.server_url;
          config.room_name = connectionDetails.room_name;
          config.participantName = connectionDetails.participant_name;
        }

        // Create assistant if it doesn't exist yet
        if (!assistantRef.current) {
          const newAssistant = createVoiceAssistant(config.provider, {
            onCallStarted: () => {
              setIsCallActive(true);
              updateButtonState('active');
              onStatusChange('connected');
            },
            onCallEnded: () => {
              setIsCallActive(false);
              updateButtonState('idle');
              onStatusChange('idle');
            },
            onAgentStartTalking: () => {
              updateButtonState('speaking');
              onStatusChange('speaking');
            },
            onAgentStopTalking: () => {
              updateButtonState('listening');
              onStatusChange('listening');
            },
            onError: (err) => {
              console.error('Voice assistant error:', err);
              setError(err.message || 'An error occurred');
              updateButtonState('error');
              onError(err);
            }
          });
          assistantRef.current = newAssistant;
          setAssistant(newAssistant);
        }
        
        // Prepare connection details for the assistant
        let assistantConnectionDetails;
        if (config.provider === 'targetai') {
          assistantConnectionDetails = {
            tokenPayload: config.tokenPayload || {},
            serverUrl: config.server_url,
            tokenServerUrl: config.tokenServerUrl,
            provider: 'targetai',
            agentUuid: config.agent_uuid,
            allowedResponses: ['voice'],
            sampleRate: 24000,
            emitRawAudioSamples: true,
            dataInput: {
              ...config.dataInput
            },
            messages: config.messages
          };
        } else if (config.provider === 'retell') {
          assistantConnectionDetails = {
            access_token: config.access_token,
            agentId: config.agent_id,
            provider: 'retell'
          };
        } else if (config.provider === 'livekit') {
          assistantConnectionDetails = {
            participantToken: config.participant_token,
            serverUrl: config.server_url,
            roomName: config.room_name,
            participantName: config.participant_name,
            provider: 'livekit'
          };
        }
        
        console.log('connectionDetails', assistantConnectionDetails);
        await assistantRef.current.connect(assistantConnectionDetails);
      } catch (err) {
        console.error('Call initiation failed:', err);
        setError(err.message || 'Failed to start call');
        updateButtonState('error');
      }
    }
  };

  const languages = [
    {code: 'en', name: 'ENGLISH', flag: '🇺🇸'},
    {code: 'es', name: 'SPANISH', flag: '🇪🇸'},
    {code: 'ru', name: 'RUSSIAN', flag: '🇷🇺'},
  ];

  return (
    <div ref={widgetElRef} className={`simple-widget ${className}`}>
      <div className="voice-widget-container">
        <div 
          ref={metallicButtonRef}
          className="metallic-button"
          onClick={isCallActive ? () => {} : requestMicrophonePermissionAndStartCall} // Only request mic if not active
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#666"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        </div>
        <button 
          ref={actionButtonRef}
          className="voice-action-button"
          onClick={startOrRestartCall}
          style={{ backgroundColor: buttonBgColor }}
        >
          {buttonIcon} {buttonText}
        </button>
        <button 
          ref={languageButtonRef}
          className="language-button"
          onClick={handleLanguageButtonClick}
        >
          {languages.find(lang => lang.code === selectedLanguage)?.flag || '🇷🇺'} ▼
        </button>
      </div>
      <div 
        ref={languageDropdownRef} 
        className="language-dropdown"
        style={{ display: isLanguageDropdownOpen ? 'flex' : 'none' }}
      >
        {languages.map(lang => (
          <div 
            key={lang.code} 
            className="language-option"
            onClick={() => {
              handleLanguageSelect(lang.code);
              console.log('Language selected:', lang.name, lang.code);
            }}
          >
            <span style={{ fontSize: '18px' }}>{lang.flag}</span>
            <span style={{ color: '#333' }}>{lang.name}</span>
          </div>
        ))}
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default VoiceWidget;


