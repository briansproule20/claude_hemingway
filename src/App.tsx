import React from 'react';
// import { EchoProvider } from '@zdql/echo-react-sdk';
import ELATutorChatbot from './components/ELATutorChatbot';
import { MockEchoProvider } from './MockEchoProvider';
import './index.css';

// Error boundary component for Echo SDK issues
class EchoErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Echo SDK Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.log('Echo SDK failed to initialize, falling back to demo mode');
      return this.props.children;
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <EchoErrorBoundary>
      <MockEchoProvider config={{ appId: 'd58eee0b-692b-4c2b-b384-6da6e513ea85' }}>
        <div className="min-h-screen w-full bg-gray-800 flex items-center justify-center">
          <div className="w-full max-w-3xl mx-auto">
            <ELATutorChatbot />
          </div>
        </div>
      </MockEchoProvider>
    </EchoErrorBoundary>
  );
};

export default App; 