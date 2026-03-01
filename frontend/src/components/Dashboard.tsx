import React, { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useGetAllPlaces } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import LoginButton from './LoginButton';
import PlacesList from './PlacesList';
import StatsPanel from './StatsPanel';
import ActivityLog from './ActivityLog';
import TripPlanner from './TripPlanner';
import UniversalMenu from './UniversalMenu';
import { BarChart3, Activity, Plane, MapPin, Menu } from 'lucide-react';

interface DashboardProps {
  cursorPosition?: { x: number; y: number };
}

export default function Dashboard({ cursorPosition: initialCursorPosition }: DashboardProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: places = [] } = useGetAllPlaces();
  const [activeTab, setActiveTab] = useState<'places' | 'trips' | 'stats' | 'activity'>('places');
  const [showUniversalMenu, setShowUniversalMenu] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(initialCursorPosition || { x: 0.5, y: 0.5 });

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

  const tabs = [
    { id: 'places' as const, label: 'Places', icon: MapPin, show: true },
    { id: 'trips' as const, label: 'Trip Planner', icon: Plane, show: true },
    { id: 'stats' as const, label: 'Statistics', icon: BarChart3, show: true },
    { id: 'activity' as const, label: 'Activity Log (All Users)', icon: Activity, show: true },
  ].filter(tab => tab.show);

  const handleTabClick = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
  };

  const handleLogoClick = () => {
    setActiveTab('places');
  };

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Clickable Logo on all non-landing pages */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLogoClick}
                  className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-all duration-200"
                  aria-label="Go to Places page"
                >
                  <img 
                    src="https://i.imgur.com/OmgQN1q.png" 
                    alt="MapMates" 
                    className="mapmates-logo-header cursor-pointer"
                  />
                </button>
                {isAuthenticated && userProfile && (
                  <p className="text-gray-700 font-medium hidden sm:block">Welcome back, {userProfile.name}! ✨</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowUniversalMenu(!showUniversalMenu)}
                className="hamburger-menu-button"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
                <span className="hidden sm:inline">Menu</span>
              </button>

              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* Universal Menu Overlay */}
      {showUniversalMenu && (
        <UniversalMenu 
          onClose={() => setShowUniversalMenu(false)}
          placesCount={places.length}
          isAuthenticated={isAuthenticated}
        />
      )}

      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-2 overflow-x-auto py-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`navigation-tab ${
                  activeTab === tab.id 
                    ? 'navigation-tab-active' 
                    : 'navigation-tab-inactive'
                }`}
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" />
                <span className="navigation-tab-text">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'places' && <PlacesList />}
        {activeTab === 'trips' && <TripPlanner />}
        {activeTab === 'stats' && <StatsPanel />}
        {activeTab === 'activity' && <ActivityLog />}
      </main>

      <footer className="border-t border-gray-200 mt-16 py-8 bg-white/80 backdrop-blur-sm">
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
