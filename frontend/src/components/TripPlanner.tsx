import React, { useState, useMemo } from 'react';
import { useGetAllPlaces, useGetCallerUserProfile, useIsAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { Place, PlaceStatus } from '../backend';
import { Calendar, Users, MapPin, Plus, Search, Filter, Clock, CheckCircle, MessageCircle, Settings, Plane, Route, Star, User, Edit, Trash2, X, AlertTriangle, Navigation, Calculator, Loader } from 'lucide-react';
import PlaceCard from './PlaceCard';

// Real trip types (these would come from backend when implemented)
interface Trip {
  id: string;
  name: string;
  description: string;
  places: Place[];
  author: string; // Principal as string
  authorName: string;
  timestamp: number;
}

interface PlaceWithDistance extends Place {
  distanceToNext?: number;
}

// Helper function to extract coordinates from notes
function extractCoordinatesFromNotes(notes: string): { lat: number; lng: number } | null {
  const coordMatch = notes.match(/coordinates:\s*([+-]?\d+\.?\d*),\s*([+-]?\d+\.?\d*)/i);
  if (coordMatch) {
    return {
      lat: parseFloat(coordMatch[1]),
      lng: parseFloat(coordMatch[2])
    };
  }
  return null;
}

export default function TripPlanner() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: places = [] } = useGetAllPlaces();
  const { data: isAdmin = false } = useIsAdmin();
  const [activeView, setActiveView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const isAuthenticated = !!identity;
  const currentUserId = identity?.getPrincipal().toString() || '';

  // Initialize with empty trips array - no hardcoded trips
  const [trips, setTrips] = useState<Trip[]>([]);

  // Calculate distances between places using simple distance calculation
  const calculateDistanceBetweenPlaces = async (place1: Place, place2: Place): Promise<number> => {
    try {
      // Extract coordinates from notes if available
      const coords1 = extractCoordinatesFromNotes(place1.notes);
      const coords2 = extractCoordinatesFromNotes(place2.notes);

      if (coords1 && coords2) {
        // Use simple haversine formula for distance calculation
        const R = 6371; // Earth's radius in kilometers
        const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
        const dLng = (coords2.lng - coords1.lng) * Math.PI / 180;
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return Math.round(distance);
      }

      // If no coordinates available, return 0
      return 0;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return 0;
    }
  };

  // Filter trips
  const filteredTrips = useMemo(() => {
    let filtered = trips;

    if (searchTerm) {
      filtered = filtered.filter(trip =>
        trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [trips, searchTerm]);

  const handleCreateTrip = async (tripData: { name: string; description: string; selectedPlaces: Place[] }) => {
    if (!isAuthenticated || !userProfile) return;

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      name: tripData.name,
      description: tripData.description,
      places: tripData.selectedPlaces,
      author: currentUserId,
      authorName: userProfile.name,
      timestamp: Date.now()
    };

    try {
      setTrips(prev => [newTrip, ...prev]);
      setActiveView('list');
    } catch (error) {
      console.error('Failed to create trip:', error);
    }
  };

  const handleEditTrip = async (tripId: string, tripData: { name: string; description: string; selectedPlaces: Place[] }) => {
    try {
      setTrips(prev => prev.map(trip => 
        trip.id === tripId 
          ? { ...trip, name: tripData.name, description: tripData.description, places: tripData.selectedPlaces }
          : trip
      ));
      if (selectedTrip?.id === tripId) {
        setSelectedTrip(prev => prev ? { ...prev, name: tripData.name, description: tripData.description, places: tripData.selectedPlaces } : null);
      }
    } catch (error) {
      console.error('Failed to update trip:', error);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    try {
      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      if (selectedTrip?.id === tripId) {
        setSelectedTrip(null);
        setActiveView('list');
      }
    } catch (error) {
      console.error('Failed to delete trip:', error);
    }
  };

  const handleDeleteAllTrips = async () => {
    try {
      setTrips([]);
      setSelectedTrip(null);
      setActiveView('list');
      setShowDeleteAllConfirm(false);
    } catch (error) {
      console.error('Failed to delete all trips:', error);
    }
  };

  const handleViewTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setActiveView('detail');
  };

  const canEditTrip = (trip: Trip) => {
    return isAuthenticated && (trip.author === currentUserId || isAdmin);
  };

  const canDeleteTrip = (trip: Trip) => {
    return isAuthenticated && (trip.author === currentUserId || isAdmin);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Planner</h2>
        <p className="text-gray-600 mb-6">
          Login with Internet Identity to create and manage trip itineraries with distance calculations.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="font-semibold text-blue-900 mb-3">Trip Planning Features</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <Plus className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Create trips with selected places from your list</span>
            </div>
            <div className="flex items-start space-x-2">
              <Edit className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Edit trip details and modify included places</span>
            </div>
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>View detailed trip information and suggested activities</span>
            </div>
            <div className="flex items-start space-x-2">
              <Calculator className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Distance calculations between places</span>
            </div>
            <div className="flex items-start space-x-2">
              <Navigation className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Optimize travel routes based on distances</span>
            </div>
            <div className="flex items-start space-x-2">
              <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Collaborative planning with role-based access</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'create') {
    return <CreateTripForm places={places} onSubmit={handleCreateTrip} onCancel={() => setActiveView('list')} />;
  }

  if (activeView === 'detail' && selectedTrip) {
    return (
      <TripDetail
        trip={selectedTrip}
        onBack={() => setActiveView('list')}
        onEdit={canEditTrip(selectedTrip) ? (tripData) => handleEditTrip(selectedTrip.id, tripData) : undefined}
        onDelete={canDeleteTrip(selectedTrip) ? () => handleDeleteTrip(selectedTrip.id) : undefined}
        places={places}
        calculateDistance={calculateDistanceBetweenPlaces}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Plane className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Trip Planner</h2>
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin && trips.length > 0 && (
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete All</span>
            </button>
          )}
          <button
            onClick={() => setActiveView('create')}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Trip</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>{filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <Calculator className="w-4 h-4" />
            <span>Distance calculations enabled</span>
          </div>
        </div>
      </div>

      {/* Trip List */}
      <div className="space-y-4">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No trips found' : 'No trips yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? `No trips match "${searchTerm}"`
                : 'Create your first trip to get started with distance-based planning!'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setActiveView('create')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Trip
              </button>
            )}
          </div>
        ) : (
          filteredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onView={() => handleViewTrip(trip)}
              onEdit={canEditTrip(trip) ? (tripData) => handleEditTrip(trip.id, tripData) : undefined}
              onDelete={canDeleteTrip(trip) ? () => handleDeleteTrip(trip.id) : undefined}
              places={places}
              calculateDistance={calculateDistanceBetweenPlaces}
            />
          ))
        )}
      </div>

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900">Delete All Trips</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete all {trips.length} trips? This action cannot be undone and will permanently remove all trip data.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ This will delete ALL trips for ALL users permanently!
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllTrips}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete All {trips.length} Trips
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Trip Card Component
function TripCard({ 
  trip, 
  onView, 
  onEdit, 
  onDelete,
  places,
  calculateDistance
}: { 
  trip: Trip; 
  onView: () => void;
  onEdit?: (tripData: { name: string; description: string; selectedPlaces: Place[] }) => void;
  onDelete?: () => void;
  places: Place[];
  calculateDistance: (place1: Place, place2: Place) => Promise<number>;
}) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  const handleEdit = (tripData: { name: string; description: string; selectedPlaces: Place[] }) => {
    if (onEdit) {
      onEdit(tripData);
    }
    setShowEditForm(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteConfirm(false);
  };

  // Calculate total distance
  React.useEffect(() => {
    const calculateTotalDistance = async () => {
      if (trip.places.length < 2) {
        setTotalDistance(0);
        return;
      }

      setIsCalculatingDistance(true);
      let total = 0;
      
      try {
        for (let i = 0; i < trip.places.length - 1; i++) {
          const distance = await calculateDistance(trip.places[i], trip.places[i + 1]);
          total += distance;
        }
        setTotalDistance(total);
      } catch (error) {
        console.error('Error calculating total distance:', error);
        setTotalDistance(0);
      } finally {
        setIsCalculatingDistance(false);
      }
    };

    calculateTotalDistance();
  }, [trip.places, calculateDistance]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{trip.name}</h3>
                <div className="flex items-center space-x-2">
                  {onEdit && (
                    <button
                      onClick={() => setShowEditForm(true)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit trip"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-3 line-clamp-2">{trip.description}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{trip.places.length} place{trip.places.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Created by {trip.authorName}</span>
            </div>
            {isCalculatingDistance ? (
              <div className="flex items-center space-x-2">
                <Loader className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-blue-600">Calculating distance...</span>
              </div>
            ) : totalDistance > 0 ? (
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span className="text-blue-600 font-medium">{totalDistance} km total</span>
              </div>
            ) : null}
          </div>

          {trip.places.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Places in this trip:</h4>
              <div className="flex flex-wrap gap-2">
                {trip.places.slice(0, 3).map((place, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {place.city}, {place.country}
                  </span>
                ))}
                {trip.places.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{trip.places.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {new Date(trip.timestamp).toLocaleDateString()}
            </span>
            <button
              onClick={onView}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
            >
              <span>View Details</span>
              {totalDistance > 0 && <Calculator className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && onEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CreateTripForm
              places={places}
              onSubmit={handleEdit}
              onCancel={() => setShowEditForm(false)}
              initialData={{
                name: trip.name,
                description: trip.description,
                selectedPlaces: trip.places
              }}
              isEditing={true}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && onDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Trip</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{trip.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Create Trip Form Component
function CreateTripForm({ 
  places, 
  onSubmit, 
  onCancel,
  initialData,
  isEditing = false
}: {
  places: Place[];
  onSubmit: (tripData: { name: string; description: string; selectedPlaces: Place[] }) => void;
  onCancel: () => void;
  initialData?: { name: string; description: string; selectedPlaces: Place[] };
  isEditing?: boolean;
}) {
  const { identity } = useInternetIdentity();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || ''
  });
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>(initialData?.selectedPlaces || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  const filteredPlaces = places.filter(place =>
    place.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        selectedPlaces
      });
    }
  };

  const togglePlace = (place: Place) => {
    setSelectedPlaces(prev => {
      const isSelected = prev.some(p => p.id === place.id);
      if (isSelected) {
        return prev.filter(p => p.id !== place.id);
      } else {
        return [...prev, place];
      }
    });
  };

  const isPlaceSelected = (place: Place) => {
    return selectedPlaces.some(p => p.id === place.id);
  };

  // Calculate total distance
  React.useEffect(() => {
    const calculateTotalDistance = async () => {
      if (selectedPlaces.length < 2) {
        setTotalDistance(0);
        return;
      }

      setIsCalculatingDistance(true);
      let total = 0;
      
      try {
        for (let i = 0; i < selectedPlaces.length - 1; i++) {
          const coords1 = extractCoordinatesFromNotes(selectedPlaces[i].notes);
          const coords2 = extractCoordinatesFromNotes(selectedPlaces[i + 1].notes);
          
          if (coords1 && coords2) {
            // Use simple haversine formula for distance calculation
            const R = 6371; // Earth's radius in kilometers
            const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
            const dLng = (coords2.lng - coords1.lng) * Math.PI / 180;
            
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) *
                      Math.sin(dLng / 2) * Math.sin(dLng / 2);
            
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            
            total += Math.round(distance);
          }
        }
        setTotalDistance(total);
      } catch (error) {
        console.error('Error calculating total distance:', error);
        setTotalDistance(0);
      } finally {
        setIsCalculatingDistance(false);
      }
    };

    calculateTotalDistance();
  }, [selectedPlaces]);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Trip' : 'Create New Trip'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trip Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., European Adventure"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your trip plans..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Places ({selectedPlaces.length} selected)
            </label>
            {isCalculatingDistance ? (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Calculating distance...</span>
              </div>
            ) : totalDistance > 0 ? (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Calculator className="w-4 h-4" />
                <span className="font-medium">{totalDistance} km total distance</span>
              </div>
            ) : null}
          </div>
          
          {/* Selected places summary */}
          {selectedPlaces.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Places:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPlaces.map((place, index) => (
                  <span
                    key={place.id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {index + 1}. {place.city}, {place.country}
                    <button
                      type="button"
                      onClick={() => togglePlace(place)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              {totalDistance > 0 && (
                <div className="mt-2 text-xs text-blue-700">
                  <Navigation className="w-3 h-3 inline mr-1" />
                  Total travel distance: <strong>{totalDistance} km</strong> (calculated using coordinates)
                </div>
              )}
            </div>
          )}

          {/* Search your places */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search your places..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Places list */}
          <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredPlaces.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {places.length === 0 ? 'No places available. Add some places first!' : 'No places match your search.'}
              </div>
            ) : (
              filteredPlaces.map((place) => (
                <div
                  key={place.id}
                  className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                    isPlaceSelected(place)
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => togglePlace(place)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isPlaceSelected(place)}
                      onChange={() => togglePlace(place)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {place.city}, {place.country}
                      </h4>
                      {place.stateRegion && (
                        <p className="text-sm text-gray-600">{place.stateRegion}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        {extractCoordinatesFromNotes(place.notes) && (
                          <div className="flex items-center space-x-1">
                            <Navigation className="w-3 h-3" />
                            <span>GPS coordinates available</span>
                          </div>
                        )}
                        {place.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {place.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                              >
                                {tag}
                              </span>
                            ))}
                            {place.tags.length > 3 && (
                              <span className="text-xs text-gray-500">+{place.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!formData.name.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isEditing ? 'Update Trip' : 'Create Trip'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Trip Detail Component
function TripDetail({ 
  trip, 
  onBack, 
  onEdit,
  onDelete,
  places,
  calculateDistance
}: {
  trip: Trip;
  onBack: () => void;
  onEdit?: (tripData: { name: string; description: string; selectedPlaces: Place[] }) => void;
  onDelete?: () => void;
  places: Place[];
  calculateDistance: (place1: Place, place2: Place) => Promise<number>;
}) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [placesWithDistances, setPlacesWithDistances] = useState<PlaceWithDistance[]>([]);
  const [isCalculatingDistances, setIsCalculatingDistances] = useState(false);

  // Calculate distances between consecutive places
  React.useEffect(() => {
    const calculateDistances = async () => {
      if (trip.places.length < 2) {
        setPlacesWithDistances(trip.places);
        return;
      }

      setIsCalculatingDistances(true);
      const placesWithDist: PlaceWithDistance[] = [];

      for (let i = 0; i < trip.places.length; i++) {
        const place = trip.places[i];
        let distanceToNext: number | undefined;

        if (i < trip.places.length - 1) {
          // Calculate distance to next place
          distanceToNext = await calculateDistance(place, trip.places[i + 1]);
        }

        placesWithDist.push({
          ...place,
          distanceToNext
        });
      }

      setPlacesWithDistances(placesWithDist);
      setIsCalculatingDistances(false);
    };

    calculateDistances();
  }, [trip.places, calculateDistance]);

  const handleEdit = (tripData: { name: string; description: string; selectedPlaces: Place[] }) => {
    if (onEdit) {
      onEdit(tripData);
    }
    setShowEditForm(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteConfirm(false);
  };

  // Generate suggested activities based on place tags
  const suggestedActivities = useMemo(() => {
    const tagActivities: { [key: string]: string[] } = {
      'Beach': ['Swimming', 'Sunbathing', 'Beach volleyball', 'Water sports', 'Snorkeling'],
      'Adventure': ['Hiking', 'Rock climbing', 'Zip-lining', 'Bungee jumping', 'Paragliding'],
      'Historical': ['Museum visits', 'Guided tours', 'Archaeological sites', 'Cultural walks', 'Heritage sites'],
      'Romantic': ['Sunset viewing', 'Fine dining', 'Couples spa', 'Wine tasting', 'Scenic walks'],
      'Food': ['Food tours', 'Cooking classes', 'Local markets', 'Street food', 'Restaurant hopping'],
      'Culture': ['Art galleries', 'Theater shows', 'Local festivals', 'Traditional performances', 'Cultural centers'],
      'Nature': ['Wildlife watching', 'National parks', 'Botanical gardens', 'Nature walks', 'Photography'],
      'Urban': ['City tours', 'Shopping', 'Nightlife', 'Architecture tours', 'Public transport exploration']
    };

    const allTags = trip.places.flatMap(place => place.tags);
    const uniqueTags = Array.from(new Set(allTags));
    const activities = new Set<string>();

    uniqueTags.forEach(tag => {
      const tagActivities_list = tagActivities[tag];
      if (tagActivities_list) {
        tagActivities_list.forEach(activity => activities.add(activity));
      }
    });

    return Array.from(activities).slice(0, 10); // Limit to 10 suggestions
  }, [trip.places]);

  // Calculate total distance
  const totalDistance = placesWithDistances.reduce((total, place) => {
    return total + (place.distanceToNext || 0);
  }, 0);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{trip.name}</h1>
              <p className="text-gray-600">Created by {trip.authorName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => setShowEditForm(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {trip.description && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-gray-700">{trip.description}</p>
          </div>
        )}

        {/* Trip Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Places</p>
                <p className="text-xl font-bold text-gray-900">{trip.places.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-2">
              <Navigation className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Distance</p>
                <p className="text-xl font-bold text-gray-900">
                  {isCalculatingDistances ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : totalDistance > 0 ? (
                    `${totalDistance} km`
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-xl font-bold text-gray-900">{new Date(trip.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Activities</p>
                <p className="text-xl font-bold text-gray-900">{suggestedActivities.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Places in Trip with Distance Information */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Trip Itinerary ({trip.places.length} places)</h3>
              {isCalculatingDistances && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Calculating distances...</span>
                </div>
              )}
            </div>
            {totalDistance > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Total travel distance: <strong>{totalDistance} km</strong> (calculated using coordinates)
              </p>
            )}
          </div>
          <div className="p-6">
            {trip.places.length === 0 ? (
              <p className="text-gray-500 italic">No places added to this trip yet.</p>
            ) : (
              <div className="space-y-6">
                {placesWithDistances.map((place, index) => (
                  <div key={place.id} className="relative">
                    <div className="flex items-start space-x-4">
                      {/* Step indicator */}
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                          {index + 1}
                        </div>
                        {index < placesWithDistances.length - 1 && (
                          <div className="w-px h-16 bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      
                      {/* Place card */}
                      <div className="flex-1">
                        <PlaceCard place={place} canEdit={false} showAddToTrip={false} hideEditControls={true} compact={true} />
                      </div>
                    </div>
                    
                    {/* Distance to next place */}
                    {place.distanceToNext !== undefined && place.distanceToNext > 0 && (
                      <div className="ml-8 mt-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          <Navigation className="w-4 h-4" />
                          <span>
                            <strong>{place.distanceToNext} km</strong> to next destination
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Suggested Activities */}
        {suggestedActivities.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Suggested Activities</h3>
              <p className="text-sm text-gray-600 mt-1">Based on the places in your trip</p>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {suggestedActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-900">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Distance Calculation Info */}
        {trip.places.length > 1 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Calculator className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Distance Calculation</h3>
                <p className="text-sm text-blue-800">
                  Distances are calculated between consecutive places in your itinerary using coordinate data when available. 
                  This helps you plan travel time and optimize your route for efficiency.
                  {totalDistance === 0 && (
                    <span className="block mt-1 font-medium">
                      Note: Distance calculation requires coordinate data from places with GPS information.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Form Modal */}
      {showEditForm && onEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CreateTripForm
              places={places}
              onSubmit={handleEdit}
              onCancel={() => setShowEditForm(false)}
              initialData={{
                name: trip.name,
                description: trip.description,
                selectedPlaces: trip.places
              }}
              isEditing={true}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && onDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Trip</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{trip.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
