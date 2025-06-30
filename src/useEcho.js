/**
 * Custom useEcho Hook - Pure JavaScript implementation
 * Provides the same interface as @zdql/echo-react-sdk but without TypeScript
 */

import { useState, useEffect, useCallback } from 'react';
import EchoClient from './echoClient';

/**
 * Custom Echo hook that mimics the official SDK interface
 * @param {Object} config - Echo configuration
 * @returns {Object} Echo state and methods
 */
export function useEcho(config = {}) {
  const [client, setClient] = useState(null);
  const [state, setState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    balance: null,
    token: null,
    error: null
  });

  // Initialize client
  useEffect(() => {
    if (!client) {
      const echoClient = new EchoClient(config);
      setClient(echoClient);
    }
  }, [config, client]);

  // Update state when client changes
  useEffect(() => {
    if (client) {
      const updateState = () => {
        const clientState = client.getState();
        setState({
          ...clientState,
          error: null
        });
      };

      // Initial state update
      updateState();

      // Set up polling for state updates
      const interval = setInterval(updateState, 1000);
      return () => clearInterval(interval);
    }
  }, [client]);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && client) {
      client.handleCallback(code).then(() => {
        // Clear the URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }, [client]);

  // Methods
  const signOut = useCallback(() => {
    if (client) {
      client.signOut();
    }
  }, [client]);

  const refreshBalance = useCallback(async () => {
    if (client) {
      return await client.refreshBalance();
    }
  }, [client]);

  const createPaymentLink = useCallback(async (amount) => {
    if (client) {
      return await client.createPaymentLink(amount);
    }
  }, [client]);

  const authenticate = useCallback(() => {
    if (client) {
      client.authenticate();
    }
  }, [client]);

  return {
    ...state,
    signOut,
    refreshBalance,
    createPaymentLink,
    authenticate
  };
}

/**
 * Custom EchoSignIn component
 */
export function EchoSignIn({ children, onSuccess, onError }) {
  const { authenticate } = useEcho();

  const handleClick = () => {
    try {
      authenticate();
      if (onSuccess) onSuccess();
    } catch (error) {
      if (onError) onError(error);
    }
  };

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  );
} 