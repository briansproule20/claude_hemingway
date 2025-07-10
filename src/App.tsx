import React from 'react';
import ELATutorChatbot from './components/ELATutorChatbot';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gray-800 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto">
        <ELATutorChatbot />
      </div>
    </div>
  );
};

export default App; 