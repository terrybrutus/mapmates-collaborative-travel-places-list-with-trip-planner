import { Activity, BarChart3, MapPin, Menu, Plane } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useGetAllPlaces } from "../hooks/useQueries";
import ActivityLog from "./ActivityLog";
import FirstTimeWalkthrough from "./FirstTimeWalkthrough";
import PlacesList from "./PlacesList";
import StatsPanel from "./StatsPanel";
import TripPlanner from "./TripPlanner";
import UniversalMenu from "./UniversalMenu";

export default function Dashboard() {
  const { displayName, isAuthenticated } = useAuth();
  const { data: places = [] } = useGetAllPlaces();
  const [activeTab, setActiveTab] = useState<"places" | "trips" | "stats" | "activity">("places");
  const [showUniversalMenu, setShowUniversalMenu] = useState(false);

  const tabs = [
    { id: "places" as const, label: "Places", icon: MapPin },
    { id: "trips" as const, label: "Trips", icon: Plane },
    { id: "stats" as const, label: "Stats", icon: BarChart3 },
    { id: "activity" as const, label: "Activity", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab("places")}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                aria-label="Go to Places"
                data-ocid="header.logo_button"
              >
                <img
                  src="https://i.imgur.com/OmgQN1q.png"
                  alt="MapMates"
                  className="mapmates-logo-header cursor-pointer"
                />
              </button>
              {isAuthenticated && displayName && (
                <p className="text-gray-700 font-medium text-sm sm:text-base">
                  <span className="hidden sm:inline">Welcome back, </span>
                  <span className="font-semibold">{displayName}</span>
                </p>
              )}
            </div>
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
          </div>
        </div>
      </header>

      {showUniversalMenu && (
        <UniversalMenu
          onClose={() => setShowUniversalMenu(false)}
          placesCount={places.length}
        />
      )}

      {/* Desktop tab nav */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm hidden sm:block">
        <div className="container mx-auto px-4">
          <div className="flex space-x-2 py-3">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`navigation-tab ${
                  activeTab === tab.id ? "navigation-tab-active" : "navigation-tab-inactive"
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

      <main className="container mx-auto px-4 py-6 pb-24 sm:pb-8">
        {activeTab === "places" && <PlacesList />}
        {activeTab === "trips" && <TripPlanner />}
        {activeTab === "stats" && <StatsPanel />}
        {activeTab === "activity" && <ActivityLog />}
      </main>

      <footer className="border-t border-gray-200 mt-8 py-6 bg-white/80 backdrop-blur-sm hidden sm:block">
        <div className="container mx-auto px-4 text-center text-gray-700 text-sm">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            caffeine.ai
          </a>
        </div>
      </footer>

      {/* Mobile bottom navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-bottom">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              data-ocid={`mobile_nav.${tab.id}_tab`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-blue-600" : "text-gray-400"}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <FirstTimeWalkthrough />
    </div>
  );
}
