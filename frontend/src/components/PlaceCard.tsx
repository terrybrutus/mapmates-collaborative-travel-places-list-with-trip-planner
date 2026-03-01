import React, { useState } from 'react';
import { Place, PlaceStatus } from '../backend';
import { useDeletePlace, useIsAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useFileUrl } from '../blob-storage/FileStorage';
import { MapPin, Clock, DollarSign, Tag, Trash2, Edit, Camera, AlertCircle, X, ChevronLeft, ChevronRight, Calendar, Star, User, Plus, Globe, Droplets } from 'lucide-react';
import AddPlaceForm from './AddPlaceForm';
import { formatTagsArray } from '../utils/textFormatting';

interface PlaceCardProps {
  place: Place;
  canEdit?: boolean;
  showAddToTrip?: boolean;
  onAddToTrip?: (place: Place) => void;
  compact?: boolean;
  hideEditControls?: boolean;
}

const statusColors = {
  toResearch: 'bg-yellow-100 text-yellow-800',
  researched: 'bg-green-100 text-green-800',
  wantToGo: 'bg-blue-100 text-blue-800',
  planning: 'bg-purple-100 text-purple-800',
  visited: 'bg-gray-100 text-gray-800',
  wouldReturn: 'bg-pink-100 text-pink-800',
};

const statusLabels = {
  toResearch: 'To Research',
  researched: 'Researched',
  wantToGo: 'Want to Go',
  planning: 'Planning',
  visited: 'Visited',
  wouldReturn: 'Would Return',
};

const budgetLabels = {
  low: '$',
  medium: '$$',
  high: '$$$',
};

function getCountryFlag(country: string): string {
  const flagMap: { [key: string]: string } = {
    'United States': '🇺🇸',
    'Canada': '🇨🇦',
    'United Kingdom': '🇬🇧',
    'France': '🇫🇷',
    'Germany': '🇩🇪',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
    'Japan': '🇯🇵',
    'Australia': '🇦🇺',
    'Brazil': '🇧🇷',
    'Mexico': '🇲🇽',
    'India': '🇮🇳',
    'China': '🇨🇳',
    'Thailand': '🇹🇭',
    'Greece': '🇬🇷',
    'Netherlands': '🇳🇱',
    'Switzerland': '🇨🇭',
    'Norway': '🇳🇴',
    'Sweden': '🇸🇪',
    'Denmark': '🇩🇰',
  };
  return flagMap[country] || '🌍';
}

// Helper function to extract geocoding data from notes
function extractGeocodingData(notes: string): { timezone?: string; isOnWater?: boolean } {
  const timezoneMatch = notes.match(/timezone:\s*([^\n,]+)/i);
  const waterMatch = notes.match(/on water:\s*(yes|no|true|false)/i);
  
  return {
    timezone: timezoneMatch ? timezoneMatch[1].trim() : undefined,
    isOnWater: waterMatch ? ['yes', 'true'].includes(waterMatch[1].toLowerCase()) : undefined
  };
}

export default function PlaceCard({ 
  place, 
  canEdit = false, 
  showAddToTrip = true, 
  onAddToTrip, 
  compact = false,
  hideEditControls = false
}: PlaceCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const deletePlace = useDeletePlace();
  const { data: isAdmin = false } = useIsAdmin();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const isCreator = identity && place.author.toString() === identity.getPrincipal().toString();
  
  // Users can edit/delete only their own places, or admin can do everything
  // But respect hideEditControls prop to completely disable editing
  const canEditPlace = !hideEditControls && isAuthenticated && (isCreator || isAdmin);
  const canDeletePlace = !hideEditControls && canEdit && canEditPlace;

  // Get cover image (first image is cover by default)
  const coverImagePath = place.images.length > 0 ? place.images[0] : null;

  // Extract geocoding data from notes
  const { timezone, isOnWater } = extractGeocodingData(place.notes);

  // Format tags for display
  const formattedTags = formatTagsArray(place.tags);

  const handleDelete = async () => {
    try {
      await deletePlace.mutateAsync(place.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete place:', error);
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleAddToTrip = () => {
    if (onAddToTrip) {
      onAddToTrip(place);
    }
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % place.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    }
  };

  if (showEditForm) {
    return (
      <div className="form-modal-overlay" onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowEditForm(false);
        }
      }}>
        <div className="form-modal-content" onClick={(e) => e.stopPropagation()}>
          <AddPlaceForm 
            editingPlace={place} 
            onCancel={() => setShowEditForm(false)} 
          />
        </div>
      </div>
    );
  }

  const cardClassName = compact 
    ? "place-card-compact" 
    : "bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow";

  return (
    <>
      <div className={cardClassName}>
        <div className={compact ? "p-4" : "p-6"}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className={`${compact ? 'text-md' : 'text-lg'} font-semibold text-gray-900 mb-1 break-words`}>
                {place.city}
                {place.stateRegion && place.stateRegion.trim() && `, ${place.stateRegion}`}
                {!compact && `, ${place.country}`}
              </h3>
              {!compact && (
                <div className="flex items-center text-gray-600 mb-2">
                  <span className="text-lg mr-2">{getCountryFlag(place.country)}</span>
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="text-sm">Main location</span>
                </div>
              )}
              
              {/* Attractions/Places/Neighborhoods Badges */}
              {place.attractions && place.attractions.length > 0 && (
                <div className="mb-2">
                  <div className="flex flex-wrap gap-1">
                    {place.attractions.slice(0, compact ? 2 : 3).map((attraction, index) => (
                      <span 
                        key={index}
                        className={`inline-flex items-center px-2 py-1 rounded-full ${compact ? 'text-xs' : 'text-sm'} font-medium bg-blue-100 text-blue-800 border border-blue-200 break-words`}
                      >
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="break-words">{attraction}</span>
                      </span>
                    ))}
                    {place.attractions.length > (compact ? 2 : 3) && (
                      <span className="text-xs text-gray-500">+{place.attractions.length - (compact ? 2 : 3)} more</span>
                    )}
                  </div>
                </div>
              )}

              {/* Geocoding Information */}
              {(timezone || isOnWater !== undefined) && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {timezone && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full ${compact ? 'text-xs' : 'text-xs'} font-medium bg-purple-100 text-purple-800 border border-purple-200`}>
                      <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span>{timezone}</span>
                    </span>
                  )}
                  {isOnWater !== undefined && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full ${compact ? 'text-xs' : 'text-xs'} font-medium ${isOnWater ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200'} border`}>
                      <Droplets className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span>{isOnWater ? 'On Water' : 'Inland'}</span>
                    </span>
                  )}
                </div>
              )}
              
              {/* Author attribution */}
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <User className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="break-words">
                  {isCreator ? 'Your place' : `Created by ${place.author.toString().slice(0, 8)}...`}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
              {showAddToTrip && isAuthenticated && onAddToTrip && (
                <button
                  onClick={handleAddToTrip}
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                  title="Add to trip"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              {canEditPlace && (
                <button
                  onClick={handleEdit}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit place"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {canDeletePlace && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete place"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Multiple Status Display */}
          {place.status.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {place.status.slice(0, compact ? 2 : 6).map((status, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded-full ${compact ? 'text-xs' : 'text-xs'} font-medium ${statusColors[status]} break-words`}
                  >
                    {statusLabels[status]}
                  </span>
                ))}
                {place.status.length > (compact ? 2 : 6) && (
                  <span className="text-xs text-gray-500">+{place.status.length - (compact ? 2 : 6)}</span>
                )}
              </div>
            </div>
          )}

          {/* Cover Photo */}
          {!compact && coverImagePath && (
            <div className="mb-4">
              <CoverPhotoThumbnail 
                imagePath={coverImagePath} 
                onClick={() => openLightbox(0)}
                placeName={`${place.city}, ${place.country}`}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Cover photo • {place.images.length} image{place.images.length !== 1 ? 's' : ''} total
                </p>
                <button
                  onClick={() => openLightbox(0)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  {place.images.length === 1 ? 'View photo' : 'View all photos'}
                </button>
              </div>
            </div>
          )}

          {/* Compact Photo Thumbnail */}
          {compact && coverImagePath && (
            <div className="mb-3">
              <CompactPhotoThumbnail 
                imagePath={coverImagePath} 
                onClick={() => openLightbox(0)}
                placeName={`${place.city}, ${place.country}`}
              />
            </div>
          )}

          {/* Quick Facts */}
          {place.quickFacts.bestKnownFor && (
            <div className="mb-3">
              <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600 break-words`}>
                <strong>Best known for:</strong> {place.quickFacts.bestKnownFor}
              </p>
            </div>
          )}

          {/* Notes */}
          {place.notes && (
            <div className="mb-3">
              <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-700 ${compact ? 'line-clamp-2' : 'line-clamp-3'} break-words`}>
                {place.notes}
              </p>
            </div>
          )}

          {/* Tags - Now formatted */}
          {formattedTags.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {formattedTags.slice(0, compact ? 2 : 3).map((tag, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-1 rounded-full ${compact ? 'text-xs' : 'text-xs'} bg-gray-100 text-gray-700 break-words`}
                  >
                    <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="break-words">{tag}</span>
                  </span>
                ))}
                {formattedTags.length > (compact ? 2 : 3) && (
                  <span className="text-xs text-gray-500">+{formattedTags.length - (compact ? 2 : 3)} more</span>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className={`flex items-center justify-between ${compact ? 'text-xs' : 'text-sm'} text-gray-500 pt-3 border-t flex-wrap gap-2`}>
            <div className="flex items-center space-x-3 flex-wrap">
              {place.budgetRange && (
                <div className="flex items-center">
                  <DollarSign className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span>{budgetLabels[place.budgetRange]}</span>
                </div>
              )}
              {place.bestTimeToVisit && (
                <div className="flex items-center min-w-0">
                  <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{place.bestTimeToVisit}</span>
                </div>
              )}
            </div>
            <span className={`${compact ? 'text-xs' : 'text-xs'} flex-shrink-0`}>
              {new Date(Number(place.timestamp) / 1000000).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Delete Confirmation Modal - Mobile Responsive */}
        {showDeleteConfirm && (
          <div className="confirmation-dialog-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteConfirm(false);
            }
          }}>
            <div className="confirmation-dialog-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Place</h3>
              <p className="text-gray-600 mb-6 break-words">
                Are you sure you want to delete "{place.city}, {place.country}"? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deletePlace.isPending}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {deletePlace.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal - Mobile Responsive */}
      {showLightbox && place.images.length > 0 && (
        <ImageLightbox
          images={place.images}
          currentIndex={currentImageIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
          onKeyDown={handleKeyDown}
          placeName={`${place.city}, ${place.country}`}
        />
      )}
    </>
  );
}

// Cover Photo Thumbnail Component
function CoverPhotoThumbnail({ 
  imagePath, 
  onClick, 
  placeName 
}: { 
  imagePath: string; 
  onClick: () => void;
  placeName: string;
}) {
  const { data: imageUrl, isLoading } = useFileUrl(imagePath);

  if (isLoading) {
    return (
      <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
        <Camera className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Failed to load cover photo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group">
      <img
        src={imageUrl}
        alt={`Cover photo of ${placeName}`}
        className="w-full h-full object-cover object-center"
        onClick={onClick}
      />
      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
        <Star className="w-3 h-3 fill-current" />
        <span>Cover</span>
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          Click to view
        </div>
      </div>
    </div>
  );
}

// Compact Photo Thumbnail Component
function CompactPhotoThumbnail({ 
  imagePath, 
  onClick, 
  placeName 
}: { 
  imagePath: string; 
  onClick: () => void;
  placeName: string;
}) {
  const { data: imageUrl, isLoading } = useFileUrl(imagePath);

  if (isLoading) {
    return (
      <div className="w-full h-24 bg-gray-200 rounded-md animate-pulse flex items-center justify-center">
        <Camera className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center">
        <AlertCircle className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-24 bg-gray-100 rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
      <img
        src={imageUrl}
        alt={`Photo of ${placeName}`}
        className="w-full h-full object-cover object-center"
        onClick={onClick}
      />
    </div>
  );
}

// Lightbox Modal Component - Mobile Responsive
function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  onKeyDown,
  placeName
}: {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeName: string;
}) {
  const { data: currentImageUrl, isLoading } = useFileUrl(images[currentIndex]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        onNext();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        onPrev();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev, images.length]);

  // Prevent body scroll when lightbox is open
  React.useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  return (
    <div className="image-lightbox-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-60 p-2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full backdrop-blur-sm hover:bg-black/70"
      >
        <X className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-4 z-60 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
          {currentIndex === 0 && (
            <span className="ml-2 text-yellow-400">
              <Star className="w-3 h-3 inline fill-current" />
            </span>
          )}
        </div>
      )}

      {/* Previous button - only show if there are multiple images */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-60 p-2 sm:p-3 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full backdrop-blur-sm hover:bg-black/70"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      {/* Next button - only show if there are multiple images */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-60 p-2 sm:p-3 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full backdrop-blur-sm hover:bg-black/70"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      {/* Image container */}
      <div className="image-lightbox-content" onClick={(e) => e.stopPropagation()}>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt={`${placeName} - Image ${currentIndex + 1}`}
            className="image-lightbox-image"
          />
        ) : (
          <div className="flex items-center justify-center text-white">
            <AlertCircle className="w-12 h-12 mr-4" />
            <span>Failed to load image</span>
          </div>
        )}
      </div>

      {/* Image title */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-60 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-center backdrop-blur-sm max-w-[90vw]">
        <div className="font-medium break-words">
          {placeName}
          {currentIndex === 0 && (
            <span className="ml-2 text-yellow-400">
              <Star className="w-3 h-3 inline fill-current" /> Cover Photo
            </span>
          )}
        </div>
        {images.length > 1 ? (
          <div className="text-sm text-gray-300 mt-1">
            Use arrow keys or click buttons to navigate
          </div>
        ) : (
          <div className="text-sm text-gray-300 mt-1">
            Click anywhere outside to close
          </div>
        )}
      </div>
    </div>
  );
}
