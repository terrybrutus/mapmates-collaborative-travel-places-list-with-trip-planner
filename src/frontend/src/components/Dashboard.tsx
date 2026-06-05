import { Activity, BarChart3, LogOut, MapPin, Menu, Plane } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useGetAllPlaces } from "../hooks/useQueries";
import ActivityLog from "./ActivityLog";
import FirstTimeWalkthrough from "./FirstTimeWalkthrough";
import PlacesList from "./PlacesList";
import StatsPanel from "./StatsPanel";
import TripPlanner from "./TripPlanner";
import UniversalMenu from "./UniversalMenu";

interface DashboardProps {
  cursorPosition?: { x: number; y: number };
}

export default function Dashboard({
  cursorPosition: initialCursorPosition,
}: DashboardProps) {
  const { displayName, isAuthenticated, logout } = useAuth();
  const { data: places = [] } = useGetAllPlaces();
  const [activeTab, setActiveTab] = useState<
    "places" | "trips" | "stats" | "activity"
  >("places");
  const [showUniversalMenu, setShowUniversalMenu] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(
    initialCursorPosition || { x: 0.5, y: 0.5 },
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setCursorPosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const hue = Math.round(cursorPosition.x * 360);
  const lightness = 78 + cursorPosition.y * 16;

  const backgroundStyle = {
    background: `radial-gradient(circle 380px at ${cursorPosition.x * 100}% ${cursorPosition.y * 100}%, 
      hsl(${hue}, 85%, ${lightness}%) 0%, 
      hsl(${(hue + 35) % 360}, 75%, ${lightness + 2}%) 35%, 
      hsl(${(hue + 70) % 360}, 65%, ${lightness + 5}%) 65%, 
      hsl(${(hue + 110) % 360}, 55%, ${lightness + 7}%))`,
    transition: "background 0.2s ease-out",
  };

  const tabs = [
    { id: "places" as const, label: "Places", icon: MapPin },
    { id: "trips" as const, label: "Trip Planner", icon: Plane },
    { id: "stats" as const, label: "Statistics", icon: BarChart3 },
    {
      id: "activity" as const,
      label: "Activity Log",
      icon: Activity,
    },
  ];

  const handleLogoClick = () => setActiveTab("places");

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleLogoClick}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-all duration-200"
                aria-label="Go to Places page"
                data-ocid="header.logo_button"
              >
                <img
                  src="https://i.imgur.com/OmgQN1q.png"
                  alt="MapMates"
                  className="mapmates-logo-header cursor-pointer"
                />
              </button>
              {isAuthenticated && displayName && (
                <p className="text-gray-700 font-medium hidden sm:block">
                  Welcome back, {displayName}! ✨
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowUniversalMenu(!showUniversalMenu)}
                className="hamburger-menu-button"
                aria-label="Open menu"
                data-ocid="header.menu_button"
              >
                <Menu className="w-5 h-5" />
                <span className="hidden sm:inline">Menu</span>
              </button>

              {/* Sign out button */}
              <button
                type="button"
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 rounded-full transition-colors font-medium text-sm bg-muted hover:bg-muted/80 text-foreground border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-ocid="header.logout_button"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-semibold">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Universal Menu Overlay */}
      {showUniversalMenu && (
        <UniversalMenu
          onClose={() => setShowUniversalMenu(false)}
          placesCount={places.length}
        />
      )}

      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-2 overflow-x-auto py-3">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`navigation-tab ${
                  activeTab === tab.id
                    ? "navigation-tab-active"
                    : "navigation-tab-inactive"
                }`}
                data-ocid={`nav.${tab.id}_tab`}
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" />
                <span className="navigation-tab-text">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {activeTab === "places" && <PlacesList />}
        {activeTab === "trips" && <TripPlanner />}
        {activeTab === "stats" && <StatsPanel />}
        {activeTab === "activity" && <ActivityLog />}
      </main>

      <footer className="border-t border-gray-200 mt-16 py-8 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-gray-700">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            caffeine.ai
          </a>
        </div>
      </footer>

      {/* First-time user walkthrough — only shown once, not for admins */}
      <FirstTimeWalkthrough />
    </div>
  );
}
