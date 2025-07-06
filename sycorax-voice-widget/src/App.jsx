import { useState } from 'react'
import VoiceWidget from './components/VoiceWidget'
// import './App.css'

function App() {
  const [widgetConfig, setWidgetConfig] = useState({
    tokenServerUrl: 'http://localhost:8001',
    companyId: 'demo_company_123',
  });

  const [status, setStatus] = useState('idle');

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  const handleError = (error) => {
    console.error('Widget error:', error);
  };

  return (
      <VoiceWidget
        config={widgetConfig}
        onStatusChange={handleStatusChange}
        onError={handleError}
      />
  )
}

export default App
