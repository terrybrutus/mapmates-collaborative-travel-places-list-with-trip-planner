import React from 'react';
import { useGetStats, useGetAllPlaces } from '../hooks/useQueries';
import { BarChart3, MapPin, Users, TrendingUp } from 'lucide-react';

export default function StatsPanel() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: places = [], isLoading: placesLoading } = useGetAllPlaces();

  if (statsLoading || placesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  // Calculate additional stats
  const totalPlaces = Number(stats.totalPlaces);
  const researchedPlaces = Number(stats.researchedPlaces);
  const toResearchPlaces = Number(stats.toResearchPlaces);
  const completionPercentage = totalPlaces > 0 ? Math.round((researchedPlaces / totalPlaces) * 100) : 0;

  // Places by continent (simplified grouping by country)
  const placesByCountry = places.reduce((acc, place) => {
    acc[place.country] = (acc[place.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCountries = Object.entries(placesByCountry)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Most active researchers
  const researcherActivity = places.reduce((acc, place) => {
    const authorId = place.author.toString();
    acc[authorId] = (acc[authorId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topResearchers = Object.entries(researcherActivity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Statistics Dashboard</h2>
      </div>

      {/* Main Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
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
              <p className="text-sm font-medium text-gray-600">Researched</p>
              <p className="text-2xl font-bold text-green-600">{researchedPlaces}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">To Research</p>
              <p className="text-2xl font-bold text-yellow-600">{toResearchPlaces}</p>
            </div>
            <Users className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion</p>
              <p className="text-2xl font-bold text-purple-600">{completionPercentage}%</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold text-sm">{completionPercentage}%</span>
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
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{researchedPlaces} researched</span>
          <span>{toResearchPlaces} remaining</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Places by Country</h3>
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
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Contributors</h3>
          <div className="space-y-3">
            {topResearchers.map(([authorId, count], index) => (
              <div key={authorId} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">{index + 1}.</span>
                  <span className="text-sm text-gray-900">
                    User {authorId.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(count / totalPlaces) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
