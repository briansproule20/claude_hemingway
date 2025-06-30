/**
 * Custom Echo Client - Pure JavaScript implementation
 * Provides authentication and API access without TypeScript dependencies
 */

class EchoClient {
  constructor(config) {
    console.log('EchoClient config:', config); // Debug log
    this.appId = config.appId || 'd58eee0b-692b-4c2b-b384-6da6e513ea85';
    this.apiUrl = 'https://echo.merit.systems'; // Force correct base URL
    this.redirectUri = window.location.origin;
    this.token = null;
    this.user = null;
    this.balance = null;
    this.isAuthenticated = false;
    this.isLoading = true;
    
    // Initialize on construction
    this.init();
  }

  /**
   * Initialize the Echo client
   */
  async init() {
    try {
      // Check for existing session
      const token = localStorage.getItem('echo_token');
      if (token) {
        this.token = token;
        await this.validateToken();
      }
    } catch (error) {
      console.error('Echo initialization error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Validate the stored token
   */
  async validateToken() {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.user = data.user;
        this.balance = data.balance;
        this.isAuthenticated = true;
        return true;
      } else {
        // Token is invalid, clear it
        this.clearSession();
        return false;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * Start OAuth authentication flow
   */
  authenticate() {
    const authUrl = `${this.apiUrl}/oauth/authorize?` + new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'read write'
    });
    console.log('Redirecting to Echo OAuth:', authUrl); // Debug log
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code) {
    try {
      this.isLoading = true;
      
      const response = await fetch(`${this.apiUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: this.appId,
          redirect_uri: this.redirectUri,
          code: code,
          grant_type: 'authorization_code'
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.access_token;
        this.user = data.user;
        this.balance = data.balance;
        this.isAuthenticated = true;
        
        // Store token
        localStorage.setItem('echo_token', this.token);
        
        return true;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Sign out the user
   */
  signOut() {
    this.clearSession();
    window.location.reload();
  }

  /**
   * Clear the current session
   */
  clearSession() {
    this.token = null;
    this.user = null;
    this.balance = null;
    this.isAuthenticated = false;
    localStorage.removeItem('echo_token');
  }

  /**
   * Refresh user balance
   */
  async refreshBalance() {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/user/balance`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.balance = data;
        return data;
      }
    } catch (error) {
      console.error('Balance refresh error:', error);
    }
  }

  /**
   * Create a payment link
   */
  async createPaymentLink(amount) {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/payments/create-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });

      if (response.ok) {
        const data = await response.json();
        return data.paymentUrl;
      }
    } catch (error) {
      console.error('Payment link creation error:', error);
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isAuthenticated: this.isAuthenticated,
      isLoading: this.isLoading,
      user: this.user,
      balance: this.balance,
      token: this.token
    };
  }
}

// Export the client
export default EchoClient; 