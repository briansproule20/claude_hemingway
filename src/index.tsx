import React from 'react';
import ReactDOM from 'react-dom/client';
import { EchoProvider } from '@zdql/echo-react-sdk';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const echoConfig = {
  appId: process.env.REACT_APP_ECHO_APP_ID || '',
  instanceId: process.env.REACT_APP_ECHO_APP_ID || '',
  apiUrl: 'https://echo.merit.systems',
  redirectUri: 'http://localhost:3000',
  scope: 'llm:invoke offline_access'
};

console.log('🔧 Echo config:', echoConfig);
console.log('🔧 App ID:', process.env.REACT_APP_ECHO_APP_ID);

root.render(
  <React.StrictMode>
    <EchoProvider config={echoConfig}>
      <App />
    </EchoProvider>
  </React.StrictMode>
); 