import { BarChart3, CheckCircle, Globe, MapPin, Plane, TrendingUp, Users } from "lucide-react";
import { useGetAllPlaces, useGetStats } from "../hooks/useQueries";

export default function StatsPanel() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: places = [], isLoading: placesLoading } = useGetAllPlaces();

  if (statsLoading || placesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!stats) return null;

  const totalPlaces = Number(stats.totalPlaces);
  const researchedPlaces = Number(stats.researchedPlaces);
  const toResearchPlaces = Number(stats.toResearchPlaces);
  const visitedPlaces = Number((stats as any).visitedPlaces ?? 0);
  const planningPlaces = Number((stats as any).planningPlaces ?? 0);
  const wantToGoPlaces = Number((stats as any).wantToGoPlaces ?? 0);
  const totalCountries = Number((stats as any).totalCountries ?? 0);
  const totalTrips = Number((stats as any).totalTrips ?? 0);

  const completionPercentage =
    totalPlaces > 0 ? Math.round((researchedPlaces / totalPlaces) * 100) : 0;

  const placesByCountry = places.reduce(
    (acc, place) => {
      acc[place.country] = (acc[place.country] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topCountries = Object.entries(placesByCountry)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Group by author username if available, otherwise by principal
  const authorActivity = places.reduce(
    (acc, place) => {
      const key = place.author.toString();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topContributors = Object.entries(authorActivity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Statistics Dashboard</h2>
      </div>

      {/* Row 1: primary counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Places</p>
              <p className="text-2xl font-bold text-gray-900">{totalPlaces}</p>
            </div>
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Countries</p>
              <p className="text-2xl font-bold text-indigo-600">{totalCountries}</p>
            </div>
            <Globe className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Researched</p>
              <p className="text-2xl font-bold text-green-600">{researchedPlaces}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion</p>
              <p className="text-2xl font-bold text-purple-600">{completionPercentage}%</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold text-xs">{completionPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: status breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="text-sm text-gray-600">Visited</p>
              <p className="text-xl font-bold text-gray-900">{visitedPlaces}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <Plane className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Planning</p>
              <p className="text-xl font-bold text-gray-900">{planningPlaces}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-amber-500" />
            <div>
              <p className="text-sm text-gray-600">Want to Go</p>
              <p className="text-xl font-bold text-gray-900">{wantToGoPlaces}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-rose-500" />
            <div>
              <p className="text-sm text-gray-600">To Research</p>
              <p className="text-xl font-bold text-gray-900">{toResearchPlaces}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{researchedPlaces} researched</span>
          <span>{toResearchPlaces} remaining</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Places by Country</h3>
          {topCountries.length === 0 ? (
            <p className="text-sm text-gray-500">No places yet.</p>
          ) : (
            <div className="space-y-3">
              {topCountries.map(([country, count], index) => (
                <div key={country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">{index + 1}.</span>
                    <span className="text-sm text-gray-900">{country}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / totalPlaces) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Contributors</h3>
          {topContributors.length === 0 ? (
            <p className="text-sm text-gray-500">No contributors yet.</p>
          ) : (
            <div className="space-y-3">
              {topContributors.map(([authorId, count], index) => (
                <div key={authorId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">{index + 1}.</span>
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 max-w-[120px] truncate" title={authorId}>
                      {authorId.length > 16 ? `${authorId.slice(0, 8)}…` : authorId}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(count / totalPlaces) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {totalTrips > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center space-x-4">
          <Plane className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-600">Trips Planned</p>
            <p className="text-2xl font-bold text-blue-600">{totalTrips}</p>
          </div>
        </div>
      )}
    </div>
  );
}
