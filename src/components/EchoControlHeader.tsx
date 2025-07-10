import React, { useState, useEffect, useRef } from 'react';
import { useEcho, EchoTokenPurchase } from '@zdql/echo-react-sdk';
import { CreditCard, ExternalLink, RefreshCw, Coins, Globe, Settings } from 'lucide-react';

const EchoControlHeader: React.FC = () => {
  const { user, balance, refreshBalance, createPaymentLink, signOut, error } = useEcho();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(100);
  const [showCreditInfo, setShowCreditInfo] = useState(false);
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const creditInfoRef = useRef<HTMLDivElement>(null);
  const accountPopupRef = useRef<HTMLDivElement>(null);

  // Check if we have placeholder/default values or session issues
  const hasPlaceholderData = user?.id === 'unknown' || user?.email === '' || user?.name === 'User';
  const hasSessionExpired = error && (error.includes('Session expired') || error.includes('expired'));
  const needsReauth = hasPlaceholderData && hasSessionExpired; // Only show warning if BOTH conditions are true

  // Debug logging
  useEffect(() => {
    console.log('🔍 === ECHO DEBUG INFO ===');
    console.log('EchoControlHeader - Full Echo context:', { user, balance, error });
    console.log('EchoControlHeader - User data:', user);
    console.log('EchoControlHeader - Balance data:', balance);
  }, [user, balance, error]);

  // Check if credits are low (less than 10)
  const isLowCredits = (balance?.credits ?? 0) < 10;
  const isCriticalCredits = (balance?.credits ?? 0) < 5;

  // Close credit info when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (creditInfoRef.current && !creditInfoRef.current.contains(event.target as Node)) {
        setShowCreditInfo(false);
      }
      if (accountPopupRef.current && !accountPopupRef.current.contains(event.target as Node)) {
        setShowAccountPopup(false);
      }
    };

    if (showCreditInfo || showAccountPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCreditInfo, showAccountPopup]);

  // Handle session expiration
  useEffect(() => {
    if (hasSessionExpired) {
      console.log('Session expired detected, showing re-authentication prompt');
      // Don't auto-sign out, let the user decide when to re-authenticate
    }
  }, [hasSessionExpired]);

  const handlePurchaseComplete = (newBalance: any) => {
    console.log('Purchase completed, new balance:', newBalance);
    setShowPurchaseModal(false);
    // Optionally refresh the balance to ensure it's up to date
    refreshBalance();
  };

  const handleCreatePaymentLink = async () => {
    try {
      const paymentLink = await createPaymentLink(purchaseAmount);
      window.open(paymentLink, '_blank');
    } catch (error) {
      console.error('Failed to create payment link:', error);
    }
  };

  const handleBuyCreditsRedirect = () => {
    window.open('https://echo.merit.systems/credits', '_blank');
  };

  const handleReauthenticate = async () => {
    try {
      await signOut();
      // The app will automatically redirect to sign-in page
    } catch (error) {
      console.error('Error during re-authentication:', error);
    }
  };

  const inspectBrowserStorage = () => {
    console.log('🔍 === FULL BROWSER STORAGE INSPECTION ===');
    
    // Check all localStorage
    console.log('📦 === LOCAL STORAGE ===');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        console.log(`localStorage[${key}]:`, localStorage.getItem(key));
      }
    }
    
    // Check all sessionStorage
    console.log('📦 === SESSION STORAGE ===');
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        console.log(`sessionStorage[${key}]:`, sessionStorage.getItem(key));
      }
    }
    
    // Check cookies
    console.log('🍪 === COOKIES ===');
    console.log('document.cookie:', document.cookie);
    
    // Check if there's any Echo-specific data in window
    console.log('🪟 === WINDOW OBJECT ===');
    const windowKeys = Object.keys(window).filter(key => 
      key.toLowerCase().includes('echo') || 
      key.toLowerCase().includes('auth') || 
      key.toLowerCase().includes('token')
    );
    console.log('Window keys containing echo/auth/token:', windowKeys);
    
         windowKeys.forEach(key => {
       console.log(`window.${key}:`, (window as any)[key]);
     });
   };

   const decodeJWTToken = () => {
     console.log('🔓 === DECODING JWT TOKEN ===');
     console.log('🔓 Button clicked! Function is executing...');
     
     try {
       const instanceId = process.env.REACT_APP_ECHO_APP_ID;
       const oidcKey = `oidc.user:https://echo.merit.systems:${instanceId}`;
       console.log('🔓 Looking for OIDC key:', oidcKey);
       
       const oidcData = sessionStorage.getItem(oidcKey);
       console.log('🔓 OIDC data found:', oidcData ? 'YES' : 'NO');
       
       if (oidcData) {
         const parsed = JSON.parse(oidcData);
         const token = parsed.access_token;
         
         if (token) {
           // Decode JWT token (it's base64 encoded)
           const parts = token.split('.');
           if (parts.length === 3) {
             const header = JSON.parse(atob(parts[0]));
             const payload = JSON.parse(atob(parts[1]));
             
             console.log('🔓 JWT Header:', header);
             console.log('🔓 JWT Payload:', payload);
             console.log('🔓 User ID from token:', payload.user_id);
             console.log('🔓 App ID from token:', payload.app_id);
             console.log('🔓 Subject from token:', payload.sub);
             console.log('🔓 Audience from token:', payload.aud);
             
             // Create account info from JWT
             const jwtAccountInfo = {
               id: payload.user_id || payload.sub,
               app_id: payload.app_id || payload.aud,
               scope: payload.scope,
               expires_at: payload.exp,
               issued_at: payload.iat,
               source: 'jwt-token'
             };
             
             console.log('🔓 Account info from JWT:', jwtAccountInfo);
             console.log('🔓 Setting account info state...');
             // setAccountInfo(jwtAccountInfo); // This line is removed as per the edit hint
             
             // Force a re-render by logging the state change
             setTimeout(() => {
               console.log('🔓 Account info state after update:', jwtAccountInfo);
             }, 100);
           }
         }
       }
     } catch (error) {
       console.error('💥 Error decoding JWT:', error);
     }
   };

   const tryMeritDirectAPI = async () => {
     console.log('🏢 === EXTRACTING USER INFO FROM JWT ===');
     
     // This function now just calls the main fetch function
     // since we're no longer trying to call external APIs
     // await fetchRealMeritAccount(); // This line is removed as per the edit hint
   };

  const fetchAccountInfo = async () => {
    console.log('🔍 Refreshing user account info...');
    // fetchRealMeritAccount(); // This line is removed as per the edit hint
  };

  // Fetch user profile from Echo API
  const fetchEchoUserProfile = async (accessToken: string, userId: string) => {
    try {
      console.log('🔍 Fetching user profile from Echo API...');
      
      // Try different Echo user info endpoints
      const endpoints = [
        'https://echo.merit.systems/api/v1/user/profile',
        'https://echo.merit.systems/api/user/profile',
        'https://echo.merit.systems/api/v1/user/me',
        'https://echo.merit.systems/api/user/me',
        'https://echo.merit.systems/api/v1/userinfo',
        'https://echo.merit.systems/api/userinfo',
        'https://echo.merit.systems/userinfo'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying user info endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const profileData = await response.json();
            console.log('✅ Got profile data from Echo:', profileData);
            return profileData;
          } else {
            console.log(`❌ ${endpoint} failed: ${response.status}`);
          }
        } catch (error) {
          console.log(`❌ ${endpoint} error:`, error);
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error fetching Echo user profile:', error);
      return null;
    }
  };

  const platformLinks = [
    {
      name: 'Merit Systems',
      url: 'https://merit.systems',
      icon: Globe,
      description: 'Main platform'
    },
    {
      name: 'Echo Platform',
      url: 'https://echo.merit.systems',
      icon: Settings,
      description: 'Echo dashboard'
    }
  ];

  const inspectOIDCData = () => {
    console.log('🔍 === DETAILED OIDC DATA INSPECTION ===');
    
    try {
      const instanceId = process.env.REACT_APP_ECHO_APP_ID;
      const oidcKey = `oidc.user:https://echo.merit.systems:${instanceId}`;
      console.log('🔑 OIDC Key:', oidcKey);
      
      const oidcData = sessionStorage.getItem(oidcKey);
      
      if (oidcData) {
        const parsed = JSON.parse(oidcData);
        console.log('📦 === FULL OIDC DATA ===');
        console.log(JSON.stringify(parsed, null, 2));
        
        console.log('🔍 === OIDC TOP-LEVEL KEYS ===');
        Object.keys(parsed).forEach(key => {
          console.log(`${key}:`, typeof parsed[key], parsed[key]);
        });
        
        if (parsed.profile) {
          console.log('👤 === PROFILE OBJECT ===');
          console.log(JSON.stringify(parsed.profile, null, 2));
          
          console.log('🔍 === PROFILE KEYS ===');
          Object.keys(parsed.profile).forEach(key => {
            console.log(`profile.${key}:`, typeof parsed.profile[key], parsed.profile[key]);
          });
        }
        
        if (parsed.access_token) {
          const token = parsed.access_token;
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log('🔓 === JWT PAYLOAD ===');
            console.log(JSON.stringify(payload, null, 2));
            
            console.log('🔍 === JWT PAYLOAD KEYS ===');
            Object.keys(payload).forEach(key => {
              console.log(`jwt.${key}:`, typeof payload[key], payload[key]);
            });
          }
        }
        
      } else {
        console.log('❌ No OIDC data found');
      }
    } catch (error) {
      console.error('💥 Error inspecting OIDC data:', error);
    }
  };

  const exploreEchoContext = () => {
    console.log('🔍 === EXPLORING ECHO SDK CONTEXT ===');
    console.log('Full Echo context:', { user, balance, error });
    
    // Check all properties and methods on the Echo context
    console.log('🔍 Echo context keys:', Object.keys({ user, balance, error }));
    
    // Check if there are any hidden or nested properties
    Object.keys({ user, balance, error }).forEach(key => {
      const value = ({ user, balance, error } as any)[key];
      console.log(`echoContext.${key}:`, typeof value, value);
      
      // If it's an object, explore its properties too
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        console.log(`  └─ ${key} properties:`, Object.keys(value));
        Object.keys(value).forEach(subKey => {
          console.log(`    └─ ${key}.${subKey}:`, typeof value[subKey], value[subKey]);
        });
      }
    });
    
    // Check if there are any methods we can call
    console.log('🔍 Checking for callable methods...');
    Object.keys({ user, balance, error }).forEach(key => {
      const value = ({ user, balance, error } as any)[key];
      if (typeof value === 'function') {
        console.log(`📞 Found method: ${key}()`);
      }
    });
  };

  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex items-center justify-between h-16">
              {/* User Info & Credits */}
              <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAccountPopup(!showAccountPopup)}
                  className="flex items-center space-x-3 hover:bg-white/10 rounded-lg p-2 transition-colors"
                  title="Click to view account details"
                >
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || 'Echo Account'}
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {user?.name || 'Echo Account'}
                    </p>
                    <p className="text-xs opacity-80">
                      {user?.email || 'Loading account...'}
                    </p>
                  </div>
                </button>
              </div>

              {/* Credits Display */}
              <div className={`flex items-center space-x-2 rounded-lg px-3 py-1 ${
                isCriticalCredits ? 'bg-red-500/20 border border-red-400' : 
                isLowCredits ? 'bg-yellow-500/20 border border-yellow-400' : 
                'bg-white/10'
              }`}>
                <Coins className={`w-4 h-4 ${
                  isCriticalCredits ? 'text-red-300' : 
                  isLowCredits ? 'text-yellow-300' : 
                  'text-yellow-300'
                }`} />
                <span className="text-sm font-medium">
                  {balance?.credits || 0} {balance?.currency || 'credits'}
                </span>
                {(isLowCredits || isCriticalCredits) && (
                  <span className="text-xs text-red-200">
                    {isCriticalCredits ? 'Critical!' : 'Low'}
                  </span>
                )}
                <button
                  onClick={refreshBalance}
                  disabled={isRefreshing}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Refresh balance"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowCreditInfo(!showCreditInfo)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Account information"
                >
                  <span className="text-xs">ℹ️</span>
                </button>
              </div>
            </div>

                          {/* Actions */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Purchase Credits Button */}
                <button
                  onClick={handleBuyCreditsRedirect}
                  className="flex items-center space-x-1 sm:space-x-2 bg-green-500 hover:bg-green-600 text-white px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                >
                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Buy Credits</span>
                  <span className="sm:hidden">Buy</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </button>

              {/* Platform Links */}
              <div className="flex items-center space-x-2">
                {platformLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    title={link.description}
                  >
                    <link.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{link.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Warning */}
      {needsReauth && (
        <div className={`px-4 py-2 text-sm flex items-center justify-between ${
          hasSessionExpired 
            ? 'bg-red-100 border border-red-400 text-red-800' 
            : 'bg-yellow-100 border border-yellow-400 text-yellow-800'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{hasSessionExpired ? '🚨' : '⚠️'}</span>
            <span>
              {hasSessionExpired 
                ? 'Session expired. Please sign in again to access your Echo account.' 
                : 'Echo account data is still loading or authentication is incomplete.'}
            </span>
          </div>
          <button
            onClick={handleReauthenticate}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors text-white ${
              hasSessionExpired 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            Sign In Again
          </button>
        </div>
      )}



      {/* Credit Info Tooltip */}
      {showCreditInfo && (
        <div 
          ref={creditInfoRef}
          className="absolute top-16 left-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-40 border"
        >
          <h4 className="font-semibold text-gray-900 mb-2">Echo Account Information</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="bg-blue-50 p-2 rounded">
              <p><strong>Name:</strong> {user?.name || 'Not available'}</p>
              <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
              <p><strong>Account ID:</strong> {user?.id || 'Authenticating...'}</p>
            </div>
            <div className="border-t pt-2">
              <p><strong>Current Balance:</strong> {balance?.credits ?? 0} credits</p>
              <p><strong>Currency:</strong> {balance?.currency || 'USD'}</p>
            </div>
            <div className="border-t pt-2">
              <p><strong>Credit Usage:</strong></p>
              <ul className="text-xs space-y-1 ml-2">
                <li>• Each AI conversation uses credits</li>
                <li>• Complex queries may use more credits</li>
                <li>• Credits refresh based on your Echo plan</li>
              </ul>
            </div>
            <div className="border-t pt-2">
              <p><strong>Status Indicators:</strong></p>
              <ul className="text-xs space-y-1 ml-2">
                <li>• <span className="text-green-600">Normal:</span> 10+ credits</li>
                <li>• <span className="text-yellow-600">Low:</span> Less than 10 credits</li>
                <li>• <span className="text-red-600">Critical:</span> Less than 5 credits</li>
              </ul>
            </div>
          </div>
          <button
            onClick={() => setShowCreditInfo(false)}
            className="mt-3 text-xs text-blue-600 hover:text-blue-800"
          >
            Close
          </button>
        </div>
      )}

      {/* Account Popup */}
      {showAccountPopup && (
        <div 
          ref={accountPopupRef}
          className="absolute top-16 left-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-40 border"
        >
          <h4 className="font-semibold text-gray-900 mb-3">Account Profile</h4>
          
          {/* User Info */}
          <div className="text-sm text-gray-600 space-y-3">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || 'Echo Account'}
                    className="w-12 h-12 rounded-full border-2 border-white"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{user?.name || 'Echo Account'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'Loading...'}</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 border-t pt-2">
                <p><strong>Account ID:</strong> {user?.id || 'Authenticating...'}</p>
              </div>
            </div>

            {/* Account Balance */}
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">{balance?.credits || 0} Credits</p>
                  <p className="text-xs text-gray-500">Current balance</p>
                </div>
              </div>
            </div>

            {/* Merit System Links */}
            <div className="border-t pt-3">
              <h5 className="font-medium text-gray-900 mb-2">Merit Systems</h5>
              <div className="space-y-2">
                {platformLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    title={link.description}
                  >
                    <link.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{link.name}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                  </a>
                ))}
              </div>
            </div>

            {/* Account Actions */}
            <div className="border-t pt-3">
              <h5 className="font-medium text-gray-900 mb-2">Account Actions</h5>
              <div className="space-y-2">
                <button
                  onClick={handleBuyCreditsRedirect}
                  className="flex items-center space-x-2 w-full p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
                >
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">Buy Credits</span>
                  <ExternalLink className="w-3 h-3 text-green-400 ml-auto" />
                </button>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 w-full p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-left"
                >
                  <span className="text-sm">🚪</span>
                  <span className="text-sm text-red-700">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowAccountPopup(false)}
            className="mt-4 text-xs text-blue-600 hover:text-blue-800"
          >
            Close
          </button>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Purchase Credits
            </h3>
            
                      <div className="space-y-4">
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <p><strong>Echo Account:</strong> {user?.id && user.id !== 'unknown' ? `${user.id.slice(0, 8)}...` : 'Authenticating...'}</p>
              <p><strong>Current balance:</strong> {balance?.credits ?? 0} credits</p>
              <p><strong>Currency:</strong> {balance?.currency || 'USD'}</p>
            </div>

            {/* Primary Option - Echo Credits Page */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Recommended:</h4>
              
              <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-3">
                  <strong>Echo Credits Page</strong> - Manage your account and purchase credits directly
                </p>
                <button
                  onClick={handleBuyCreditsRedirect}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Go to Echo Credits</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <h4 className="font-medium text-gray-900 pt-2">Alternative Options:</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (credits)
                </label>
                <input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Echo Token Purchase Component */}
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-2">
                  SDK Token Purchase
                </p>
                <EchoTokenPurchase
                  amount={purchaseAmount}
                  onPurchaseComplete={handlePurchaseComplete}
                  onError={(error) => console.error('Purchase error:', error)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Purchase {purchaseAmount} Credits
                </EchoTokenPurchase>
              </div>

              {/* Direct Payment Link */}
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-2">
                  Direct Payment Link
                </p>
                <button
                  onClick={handleCreatePaymentLink}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Create Payment Link
                </button>
              </div>
            </div>
          </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EchoControlHeader; 