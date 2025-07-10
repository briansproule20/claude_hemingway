import React, { useEffect, useState } from 'react';
import { EchoSignIn, useEcho } from '@zdql/echo-react-sdk';

function App() {
  const echo = useEcho();
  const [signInAttempted, setSignInAttempted] = useState(false);

  useEffect(() => {
    console.log('Echo context:', echo);
    console.log('Echo SDK loaded:', !!echo);
    console.log('Instance ID from env:', process.env.REACT_APP_ECHO_APP_ID);
    
    if (echo?.isAuthenticated) {
      console.log('User is authenticated!', echo.user);
    }
    
    if (echo?.error) {
      console.log('Echo error:', echo.error);
    }
  }, [echo]);

  const handleSignInClick = () => {
    console.log('Debug button clicked!');
    console.log('Echo state:', echo);
    setSignInAttempted(true);
  };

  const handleManualSignIn = async () => {
    console.log('Manual sign in triggered');
    try {
      // Try to manually trigger sign in if the SDK has a signIn method
      if (echo && typeof echo.signIn === 'function') {
        console.log('Calling echo.signIn()');
        await echo.signIn();
      } else {
        console.log('No signIn method found on echo object');
      }
    } catch (error) {
      console.error('Manual sign in error:', error);
    }
  };

  const handleSignInSuccess = (user: any) => {
    console.log('Sign in successful!', user);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Echo Test</h1>
      <p>Testing Echo SDK integration...</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Echo Status:</h3>
        <p>Loading: {echo?.isLoading ? 'Yes' : 'No'}</p>
        <p>Authenticated: {echo?.isAuthenticated ? 'Yes' : 'No'}</p>
        <p>Error: {echo?.error || 'None'}</p>
        <p>User: {echo?.user ? JSON.stringify(echo.user) : 'None'}</p>
        <p>Available methods: {echo ? Object.keys(echo).join(', ') : 'None'}</p>
      </div>
      
      <button onClick={handleSignInClick} style={{ marginRight: '10px' }}>
        Debug Sign In
      </button>
      
      <button onClick={handleManualSignIn} style={{ marginRight: '10px' }}>
        Manual Sign In
      </button>
      
      <div style={{ border: '1px solid #ccc', padding: '10px', display: 'inline-block' }}>
        <p>EchoSignIn Component:</p>
        <EchoSignIn onSuccess={handleSignInSuccess} />
      </div>
      
      {signInAttempted && (
        <p style={{ color: 'blue', marginTop: '10px' }}>
          Debug button clicked! Check console for details.
        </p>
      )}
    </div>
  );
}

export default App; 