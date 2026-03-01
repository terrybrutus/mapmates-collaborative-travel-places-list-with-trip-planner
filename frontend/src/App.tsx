import React, { useState, useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import LoginButton from './components/LoginButton';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [cursorPosition, setCursorPosition] = useState({ x: 0.5, y: 0.5 });

  const isAuthenticated = !!identity;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setCursorPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Enhanced cursor trail animation with improved focal point visibility
  // Increased opacity and reduced blur for better definition while maintaining elegance
  const hue = Math.round(cursorPosition.x * 360);
  const lightness = 78 + cursorPosition.y * 16; // Adjusted for better contrast

  const backgroundStyle = {
    background: `radial-gradient(circle 380px at ${cursorPosition.x * 100}% ${cursorPosition.y * 100}%, 
      hsl(${hue}, 85%, ${lightness}%) 0%, 
      hsl(${(hue + 35) % 360}, 75%, ${lightness + 2}%) 35%, 
      hsl(${(hue + 70) % 360}, 65%, ${lightness + 5}%) 65%, 
      hsl(${(hue + 110) % 360}, 55%, ${lightness + 7}%))`,
    transition: 'background 0.2s ease-out',
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={backgroundStyle}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-900 text-lg font-medium">Preparing your adventure...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={backgroundStyle}>
        <header className="w-full p-4 relative z-10">
          <div className="flex justify-end items-center">
            <LoginButton />
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-12">
              {/* Main Logo Section - Reduced to 40-50% of original double size for better balance */}
              <div className="flex justify-center items-center mb-8">
                <img 
                  src="https://i.imgur.com/OmgQN1q.png" 
                  alt="MapMates" 
                  className="mapmates-logo-landing"
                />
              </div>
              
              <p className="text-xl md:text-2xl text-gray-900 mb-12 font-medium max-w-3xl mx-auto leading-relaxed">
                Discover amazing destinations, plan epic adventures, and share your travel dreams with fellow explorers
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="p-8 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm">
                  <div className="mb-6 flex justify-center">
                    <img 
                      src="https://i.imgur.com/RvjjNgw.gif" 
                      alt="Discover Places" 
                      className="feature-box-image"
                    />
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-gray-900">Discover Places</h3>
                  <p className="text-gray-700 leading-relaxed">Explore breathtaking destinations from around the world and add them to your bucket list</p>
                </div>
                
                <div className="p-8 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm">
                  <div className="mb-6 flex justify-center">
                    <img 
                      src="https://i.imgur.com/otenCBb.gif" 
                      alt="Collaborate" 
                      className="feature-box-image"
                    />
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-gray-900">Collaborate</h3>
                  <p className="text-gray-700 leading-relaxed">Work together with friends to research and document amazing travel experiences</p>
                </div>
                
                <div className="p-8 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm">
                  <div className="mb-6 flex justify-center">
                    <img 
                      src="https://i.imgur.com/aiNJ0Xd.gif" 
                      alt="Plan Adventures" 
                      className="feature-box-image"
                    />
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-gray-900">Plan Adventures</h3>
                  <p className="text-gray-700 leading-relaxed">Create detailed itineraries and turn your travel dreams into reality</p>
                </div>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto p-8 border border-blue-200 rounded-lg bg-blue-50/90 backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">🔐</div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-xl text-blue-900 mb-4">Login Required for Full Access</h3>
                  
                  <div className="space-y-4 text-blue-800">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">✨</div>
                      <div>
                        <p className="font-semibold text-blue-900">Internet Identity Required For:</p>
                        <ul className="list-disc list-inside ml-2 space-y-1 text-sm">
                          <li>Adding and editing travel places ✈️</li>
                          <li>Uploading photos and files 📸</li>
                          <li>Creating and managing trip itineraries 🗺️</li>
                          <li>Collaborative features and notes 👥</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">🔒</div>
                      <div>
                        <p className="font-semibold text-blue-900">Why Internet Identity?</p>
                        <p className="text-sm">Secure, decentralized authentication that protects your privacy while enabling collaboration</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-100/80 rounded-lg border border-blue-300">
                    <p className="text-xs text-blue-700">
                      <strong className="text-blue-800">New to Internet Identity?</strong> It's a secure, privacy-focused login system. 
                      No passwords needed - just use your device's biometrics or security key. 🔐
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <footer className="mt-16 py-8 border-t border-gray-200 relative z-10 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 text-center text-gray-700">
            © 2025. Built with ❤️ using{' '}
            <a href="https://caffeine.ai" className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
              caffeine.ai
            </a>
          </div>
        </footer>
      </div>
    );
  }

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (showProfileSetup) {
    return <ProfileSetup />;
  }

  return <Dashboard cursorPosition={cursorPosition} />;
}
