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

    // End active call when language changes
    if (isCallActive && assistantRef.current) {
      assistantRef.current.disconnect();
      setIsCallActive(false);
      setError(null);
    }

    // Reset button state to idle when language changes
    updateButtonState('idle');
  };

  const updateButtonState = (state) => {
    setCurrentState(state);
    let buttonText = '';
    let buttonIcon = '';
    let buttonBgColor = '#000';

    switch (state) {
      case 'idle':
        buttonText = getTranslation('voiceChat');
        buttonIcon = '📞';
        break;
      case 'connecting':
        buttonText = getTranslation('connecting');
        buttonIcon = '🔄';
        buttonBgColor = '#ffc107';
        break;
      case 'listening':
        buttonText = getTranslation('listening');
        buttonIcon = '👂';
        buttonBgColor = '#2196f3';
        break;
      case 'speaking':
        buttonText = getTranslation('speaking');
        buttonIcon = '🗣️';
        buttonBgColor = '#9c27b0';
        break;
      case 'active': // Call started, ready to end
        buttonText = getTranslation('endCall');
        buttonIcon = '📞';
        buttonBgColor = '#f44336';
        break;
      case 'error':
        buttonText = getTranslation('error');
        buttonIcon = '❌';
        buttonBgColor = '#f44336';
        break;
      case 'unavailable':
        buttonText = getTranslation('unavailable');
        buttonIcon = '❌';
        buttonBgColor = '#f44336';
        break;
      default:
        buttonText = getTranslation('voiceChat');
        buttonIcon = '📞';
    }

    if (actionButtonRef.current) {
      actionButtonRef.current.innerHTML = `${buttonIcon} ${buttonText}`;
      actionButtonRef.current.style.backgroundColor = buttonBgColor;
    }
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

      try {
        // Only create the assistant instance during initialization without connecting
        // Connection details will be fetched when the user clicks to connect
        const newAssistant = createVoiceAssistant(config.provider || 'targetai', {
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
      } catch (err) {
        console.error(err);
        setError(err.message);
        updateButtonState('error');
        onError(err);
      }

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
  }, [initialized, config, onStatusChange, onError]);

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
    // If call is active, disconnect and reset state
    assistantRef.current.disconnect();
    setIsCallActive(false);
    updateButtonState('idle');
  } else {
    try {
      updateButtonState('connecting');
      setError(null);

      // Fetch fresh connection details with current language
      // This is now the only place where connection details are fetched
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

      // Process connection details based on provider
      let processedConnectionDetails;

      if (connectionDetails.provider === 'targetai') {
        processedConnectionDetails = {
          tokenPayload: config.tokenPayload || {},
          serverUrl: connectionDetails.server_url,
          tokenServerUrl: config.tokenServerUrl,
          provider: 'targetai',
          agentUuid: connectionDetails.agent_uuid,
          allowedResponses: ['voice'],
          sampleRate: 24000,
          emitRawAudioSamples: true,
          dataInput: {
            ...config.dataInput
          },
          messages: connectionDetails.messages
        };
      } else if (connectionDetails.provider === 'retell') {
        processedConnectionDetails = {
          access_token: connectionDetails.access_token,
          agentId: connectionDetails.agent_id,
          provider: 'retell'
        };
      } else if (connectionDetails.provider === 'livekit') {
        processedConnectionDetails = {
          participantToken: connectionDetails.participant_token,
          serverUrl: connectionDetails.server_url,
          roomName: connectionDetails.room_name,
          participantName: connectionDetails.participant_name,
          provider: 'livekit'
        };
      }

      console.log('connectionDetails', processedConnectionDetails);
      await assistantRef.current.connect(processedConnectionDetails);
    } catch (err) {
      console.error('Call initiation failed:', err);
      setError(err.message || 'Failed to start call');
      setIsCallActive(false);
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
        >
          📞 {getTranslation('voiceChat')}
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
