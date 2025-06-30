import React from 'react';
import { useEcho } from './useEcho';
import ELATutorChatbot from './components/ELATutorChatbot';

function App() {
  // Echo configuration
  const echoConfig = {
    appId: 'd58eee0b-692b-4c2b-b384-6da6e513ea85',
    apiUrl: 'https://echo.merit.systems',
    redirectUri: window.location.origin,
  };

  useEcho(echoConfig); // Still initialize Echo for the chatbot

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main content: Chatbot always visible */}
      <div className="max-w-3xl mx-auto mt-8">
        <ELATutorChatbot />
      </div>
    </div>
  );
}

export default App; 