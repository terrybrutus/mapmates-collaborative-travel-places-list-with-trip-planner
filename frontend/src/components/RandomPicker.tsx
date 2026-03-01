import React, { useState } from 'react';
import { useGetRandomToResearchPlace } from '../hooks/useQueries';
import { Place } from '../backend';
import PlaceCard from './PlaceCard';
import { Shuffle, RefreshCw } from 'lucide-react';

export default function RandomPicker() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const getRandomPlace = useGetRandomToResearchPlace();

  const handlePickRandom = async () => {
    try {
      const place = await getRandomPlace.mutateAsync();
      setSelectedPlace(place);
    } catch (error) {
      console.error('Failed to get random place:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Shuffle className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Random Research Picker</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Need inspiration? Let us pick a random place for you to research!
        </p>
        
        <button
          onClick={handlePickRandom}
          disabled={getRandomPlace.isPending}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 mx-auto"
        >
          {getRandomPlace.isPending ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Shuffle className="w-5 h-5" />
          )}
          <span>{getRandomPlace.isPending ? 'Picking...' : 'Pick Random Place'}</span>
        </button>
      </div>

      {selectedPlace && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your research destination:
            </h3>
          </div>
          {/* Enable full edit and delete functionality on Random Picker page - same as View Places */}
          <PlaceCard 
            place={selectedPlace} 
            canEdit={true}
            showAddToTrip={false}
            hideEditControls={false}
          />
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Ready to dive in and research this amazing place? 🔍
            </p>
          </div>
        </div>
      )}

      {getRandomPlace.data === null && !getRandomPlace.isPending && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            All caught up!
          </h3>
          <p className="text-gray-600">
            There are no places left to research. Great job!
          </p>
        </div>
      )}
    </div>
  );
}
