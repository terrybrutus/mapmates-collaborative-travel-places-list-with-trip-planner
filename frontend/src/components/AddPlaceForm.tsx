import React, { useState, useCallback } from 'react';
import { useAddPlace, useUpdatePlace } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useFileUpload, useFileUrl } from '../blob-storage/FileStorage';
import { Place, PlaceStatus, BudgetRange } from '../backend';
import { MapPin, Save, CheckCircle, AlertCircle, Upload, X, Camera, Calendar, ChevronDown, Star, GripVertical, Plus, Minus } from 'lucide-react';
import CountryInput from './CountryInput';
import { getStandardCountryName } from '../utils/countryMapping';
import { formatPlaceData, parseAndFormatTags, formatPlaceName, formatSentenceField, formatNotes, formatBestTimeToVisit, toTitleCase } from '../utils/textFormatting';

interface AddPlaceFormProps {
  editingPlace?: Place;
  onCancel?: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const STATUS_OPTIONS = [
  { value: PlaceStatus.toResearch, label: 'To Research', color: 'bg-yellow-100 text-yellow-800' },
  { value: PlaceStatus.researched, label: 'Researched', color: 'bg-green-100 text-green-800' },
  { value: PlaceStatus.wantToGo, label: 'Want to Go', color: 'bg-blue-100 text-blue-800' },
  { value: PlaceStatus.planning, label: 'Currently Planning', color: 'bg-purple-100 text-purple-800' },
  { value: PlaceStatus.visited, label: 'Visited', color: 'bg-gray-100 text-gray-800' },
  { value: PlaceStatus.wouldReturn, label: 'Would Return', color: 'bg-pink-100 text-pink-800' },
];

export default function AddPlaceForm({ editingPlace, onCancel }: AddPlaceFormProps) {
  const { identity } = useInternetIdentity();
  const addPlace = useAddPlace();
  const updatePlace = useUpdatePlace();
  const { uploadFile, isUploading } = useFileUpload();

  const isEditing = !!editingPlace;

  // Extract attractions from existing place data
  const extractAttractionsFromPlace = (place?: Place): string[] => {
    if (!place) return [''];
    
    // If the place has attractions array, use it
    if (place.attractions && place.attractions.length > 0) {
      return place.attractions;
    }
    
    // Otherwise, try to extract from notes (legacy support)
    if (place.notes) {
      const lines = place.notes.split('\n');
      const firstLine = lines[0].trim();
      
      if (lines.length > 1 && firstLine.length < 100 && !firstLine.endsWith('.')) {
        return [firstLine];
      }
    }
    
    return [''];
  };

  const [formData, setFormData] = useState({
    country: editingPlace?.country || '',
    stateRegion: editingPlace?.stateRegion || '',
    city: editingPlace?.city || '',
    notes: editingPlace?.notes || '',
    tags: editingPlace?.tags.join(', ') || '',
    budgetRange: editingPlace?.budgetRange || BudgetRange.medium,
    bestTimeToVisit: editingPlace?.bestTimeToVisit || '',
    bestKnownFor: editingPlace?.quickFacts.bestKnownFor || '',
    hiddenGem: editingPlace?.quickFacts.hiddenGem || '',
    localTip: editingPlace?.quickFacts.localTip || '',
  });

  // Multiple attractions support
  const [attractions, setAttractions] = useState<string[]>(extractAttractionsFromPlace(editingPlace));

  // Multi-status selection - now fully supported
  const [selectedStatuses, setSelectedStatuses] = useState<PlaceStatus[]>(
    editingPlace ? editingPlace.status : [PlaceStatus.toResearch]
  );

  // Month picker state with enhanced mobile support
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<number[]>(() => {
    if (editingPlace?.bestTimeToVisit) {
      // Try to parse existing month data
      const monthNames = editingPlace.bestTimeToVisit.toLowerCase();
      const months: number[] = [];
      MONTHS.forEach((month, index) => {
        if (monthNames.includes(month.toLowerCase())) {
          months.push(index);
        }
      });
      return months;
    }
    return [];
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>(editingPlace?.images || []);
  const [coverImageIndex, setCoverImageIndex] = useState<number>(0); // First image is cover by default
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Attraction management functions
  const addAttraction = () => {
    setAttractions([...attractions, '']);
  };

  const removeAttraction = (index: number) => {
    if (attractions.length > 1) {
      const newAttractions = attractions.filter((_, i) => i !== index);
      setAttractions(newAttractions);
    }
  };

  const updateAttraction = (index: number, value: string) => {
    const newAttractions = [...attractions];
    newAttractions[index] = toTitleCase(value);
    setAttractions(newAttractions);
  };

  const handleImageUpload = useCallback(async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        setUploadMessage({ type: 'error', text: 'Only image files are allowed.' });
        setTimeout(() => setUploadMessage(null), 3000);
        continue;
      }

      // Updated file size limit to 20MB
      if (file.size > 20 * 1024 * 1024) {
        setUploadMessage({ type: 'error', text: 'Image must be less than 20MB.' });
        setTimeout(() => setUploadMessage(null), 3000);
        continue;
      }

      try {
        const placeId = editingPlace?.id || `temp-${Date.now()}`;
        const imagePath = `places/${placeId}/${Date.now()}-${file.name}`;
        await uploadFile(imagePath, file);
        
        setUploadedImages(prev => [...prev, imagePath]);
        setUploadMessage({ type: 'success', text: 'Image uploaded successfully!' });
        setTimeout(() => setUploadMessage(null), 3000);
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadMessage({ type: 'error', text: 'Upload failed. Please try again.' });
        setTimeout(() => setUploadMessage(null), 3000);
      }
    }
  }, [uploadFile, editingPlace?.id]);

  const removeImage = (imagePath: string) => {
    const index = uploadedImages.indexOf(imagePath);
    setUploadedImages(prev => prev.filter(path => path !== imagePath));
    
    // Adjust cover image index if necessary
    if (index === coverImageIndex && uploadedImages.length > 1) {
      setCoverImageIndex(0); // Set first remaining image as cover
    } else if (index < coverImageIndex) {
      setCoverImageIndex(prev => prev - 1);
    }
  };

  // Updated setCoverImage function - no automatic saving or closing
  const setCoverImage = (index: number) => {
    setCoverImageIndex(index);
    // Note: This only updates the local state, does not save or close the panel
    // Users can continue editing other fields and save when ready
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...uploadedImages];
    const draggedImage = newImages[draggedIndex];
    
    // Remove dragged item
    newImages.splice(draggedIndex, 1);
    
    // Insert at new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newImages.splice(insertIndex, 0, draggedImage);
    
    setUploadedImages(newImages);
    
    // Update cover image index if necessary
    if (draggedIndex === coverImageIndex) {
      setCoverImageIndex(insertIndex);
    } else if (draggedIndex < coverImageIndex && insertIndex >= coverImageIndex) {
      setCoverImageIndex(prev => prev - 1);
    } else if (draggedIndex > coverImageIndex && insertIndex <= coverImageIndex) {
      setCoverImageIndex(prev => prev + 1);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const toggleStatus = (status: PlaceStatus) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  // Enhanced mobile-friendly month toggle with reliable touch interaction
  const toggleMonth = (monthIndex: number) => {
    setSelectedMonths(prev => {
      if (prev.includes(monthIndex)) {
        return prev.filter(m => m !== monthIndex);
      } else {
        return [...prev, monthIndex].sort((a, b) => a - b);
      }
    });
  };

  const formatSelectedMonths = () => {
    if (selectedMonths.length === 0) return '';
    if (selectedMonths.length === 12) return 'Year-round';
    
    // Group consecutive months
    const groups: number[][] = [];
    let currentGroup: number[] = [];
    
    selectedMonths.forEach((month, index) => {
      if (index === 0 || month !== selectedMonths[index - 1] + 1) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [month];
      } else {
        currentGroup.push(month);
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups.map(group => {
      if (group.length === 1) {
        return MONTHS[group[0]];
      } else if (group.length === 2) {
        return `${MONTHS[group[0]]}, ${MONTHS[group[1]]}`;
      } else {
        return `${MONTHS[group[0]]} - ${MONTHS[group[group.length - 1]]}`;
      }
    }).join(', ');
  };

  // Handle country change with standardization
  const handleCountryChange = (country: string) => {
    const standardizedCountry = getStandardCountryName(country);
    setFormData({ ...formData, country: standardizedCountry });
  };

  // Handle form field changes - Updated to use same input parameters for all fields except Tags
  const handleFieldChange = (field: string, value: string) => {
    let formattedValue = value;

    switch (field) {
      case 'tags':
        // Don't format tags on every keystroke, only on blur or save
        formattedValue = value;
        break;
      default:
        // All other fields now use sentence case formatting with full whitespace support
        // Allow normal spacebar functionality during typing
        formattedValue = value; // Keep original value during typing
    }

    setFormData({ ...formData, [field]: formattedValue });
  };

  // Handle tags formatting on blur
  const handleTagsBlur = () => {
    const formattedTags = parseAndFormatTags(formData.tags).join(', ');
    setFormData({ ...formData, tags: formattedTags });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) return;

    // Reorder images so cover image is first
    const reorderedImages = [...uploadedImages];
    if (coverImageIndex > 0 && coverImageIndex < reorderedImages.length) {
      const coverImage = reorderedImages[coverImageIndex];
      reorderedImages.splice(coverImageIndex, 1);
      reorderedImages.unshift(coverImage);
    }

    // Ensure country is standardized before saving
    const standardizedCountry = getStandardCountryName(formData.country);

    // Filter out empty attractions
    const validAttractions = attractions.filter(attraction => attraction.trim().length > 0);

    // Create place data with automatic formatting applied
    const rawPlaceData: Place = {
      id: editingPlace?.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      country: standardizedCountry,
      stateRegion: formatSentenceField(formData.stateRegion),
      city: formatSentenceField(formData.city),
      notes: formatSentenceField(formData.notes),
      status: selectedStatuses,
      tags: parseAndFormatTags(formData.tags),
      budgetRange: formData.budgetRange,
      bestTimeToVisit: formatSelectedMonths(),
      quickFacts: {
        bestKnownFor: formatSentenceField(formData.bestKnownFor),
        hiddenGem: formatSentenceField(formData.hiddenGem),
        localTip: formatSentenceField(formData.localTip),
      },
      images: reorderedImages,
      author: editingPlace?.author || identity.getPrincipal(),
      timestamp: editingPlace?.timestamp || BigInt(Date.now() * 1000000),
      attractions: validAttractions,
    };

    // Apply comprehensive formatting
    const placeData = formatPlaceData(rawPlaceData);

    try {
      if (isEditing) {
        await updatePlace.mutateAsync(placeData);
        setMessage({ type: 'success', text: 'Place Updated Successfully!' });
      } else {
        await addPlace.mutateAsync(placeData);
        setMessage({ type: 'success', text: 'New Place Added Successfully!' });
        
        // Reset form for new place
        setFormData({
          country: '',
          stateRegion: '',
          city: '',
          notes: '',
          tags: '',
          budgetRange: BudgetRange.medium,
          bestTimeToVisit: '',
          bestKnownFor: '',
          hiddenGem: '',
          localTip: '',
        });
        setAttractions(['']);
        setSelectedStatuses([PlaceStatus.toResearch]);
        setSelectedMonths([]);
        setUploadedImages([]);
        setCoverImageIndex(0);
      }

      setTimeout(() => setMessage(null), 5000);
      if (onCancel) {
        setTimeout(() => onCancel(), 1500);
      }
    } catch (error) {
      console.error('Failed to save place:', error);
      setMessage({ 
        type: 'error', 
        text: isEditing ? 'Failed to Update Place. Please try again.' : 'Failed to Add Place. Please try again.' 
      });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Enhanced mobile-friendly month picker close handler
  const handleMonthPickerClose = () => {
    setShowMonthPicker(false);
  };

  return (
    <div className="mobile-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        if (onCancel) onCancel();
      }
    }}>
      <div className="mobile-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-modal-content">
          {/* Success/Error Message */}
          {message && (
            <div className={`mx-4 mt-4 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          <div className="mobile-modal-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Edit Place' : 'Add New Place'}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mobile-modal-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location Fields */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="form-field">
                  <label className="form-label">
                    Country *
                  </label>
                  <CountryInput
                    value={formData.country}
                    onChange={handleCountryChange}
                    placeholder="e.g., United States, UK, Japan..."
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">
                    State/Region
                  </label>
                  <input
                    type="text"
                    value={formData.stateRegion}
                    onChange={(e) => handleFieldChange('stateRegion', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Provence"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">
                    City/Town/Village *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Nice"
                  />
                </div>
              </div>

              {/* Multiple Attractions/Places/Neighborhoods Field */}
              <div className="form-field">
                <label className="form-label">
                  Attractions/Places/Neighborhoods (Optional)
                </label>
                <div className="space-y-3">
                  {attractions.map((attraction, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={attraction}
                        onChange={(e) => updateAttraction(index, e.target.value)}
                        className="form-input flex-1"
                        placeholder={`e.g., ${index === 0 ? 'Eiffel Tower' : index === 1 ? 'Central Park' : 'Montmartre'}`}
                      />
                      {attractions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAttraction(index)}
                          className="p-2 text-red-600 hover:text-red-700 transition-colors"
                          title="Remove attraction"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                      {index === attractions.length - 1 && (
                        <button
                          type="button"
                          onClick={addAttraction}
                          className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                          title="Add another attraction"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="form-help-text">
                  Add specific attractions, landmarks, neighborhoods, or areas within the city. Click + to add more entries.
                </p>
              </div>

              {/* Status Selection - Multi-select */}
              <div className="form-field">
                <label className="form-label">
                  Status (Multiple Selection Supported)
                </label>
                <div className="grid md:grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`status-checkbox ${
                        selectedStatuses.includes(option.value)
                          ? 'status-checkbox-selected'
                          : 'status-checkbox-unselected'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(option.value)}
                        onChange={() => toggleStatus(option.value)}
                        className="status-checkbox-input"
                      />
                      <span className={`status-badge ${option.color}`}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
                {selectedStatuses.length > 1 && (
                  <div className="status-selection-feedback">
                    <p className="text-sm text-green-800">
                      <strong>Selected statuses:</strong> {selectedStatuses.map(s => STATUS_OPTIONS.find(o => o.value === s)?.label).join(', ')}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ✅ All selected statuses will be saved and displayed for this place.
                    </p>
                  </div>
                )}
                {selectedStatuses.length === 0 && (
                  <p className="text-sm text-red-600 mt-2">Please select at least one status.</p>
                )}
              </div>

              {/* Budget Range */}
              <div className="form-field">
                <label className="form-label">
                  Budget Range
                </label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value as BudgetRange })}
                  className="form-select"
                >
                  <option value={BudgetRange.low}>$ (Budget-friendly)</option>
                  <option value={BudgetRange.medium}>$$ (Moderate)</option>
                  <option value={BudgetRange.high}>$$$ (Expensive)</option>
                </select>
              </div>

              {/* Best Time to Visit - Enhanced Mobile Month Picker */}
              <div className="form-field">
                <label className="form-label">
                  Best Time to Visit
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMonthPicker(!showMonthPicker)}
                    className="mobile-optimized-button"
                  >
                    <span className={selectedMonths.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
                      {selectedMonths.length === 0 ? 'Select months...' : formatSelectedMonths()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {showMonthPicker && (
                    <>
                      {/* Mobile backdrop */}
                      <div 
                        className="fixed inset-0 bg-black bg-opacity-25 z-10 md:hidden"
                        onClick={handleMonthPickerClose}
                      />
                      
                      <div className="mobile-optimized-dropdown">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900">Select Best Months to Visit</h4>
                            <button
                              type="button"
                              onClick={() => setSelectedMonths([])}
                              className="mobile-touch-target text-xs text-gray-500 hover:text-gray-700"
                            >
                              Clear All
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {MONTHS.map((month, index) => (
                              <label
                                key={month}
                                className={`mobile-month-option ${
                                  selectedMonths.includes(index)
                                    ? 'month-option-selected'
                                    : 'month-option-unselected'
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleMonth(index);
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedMonths.includes(index)}
                                  onChange={() => toggleMonth(index)}
                                  className="mobile-checkbox"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="mobile-month-text">{month}</span>
                              </label>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <button
                              type="button"
                              onClick={handleMonthPickerClose}
                              className="mobile-done-button w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <p className="form-help-text">
                  Select one or more months when this destination is best to visit. Tap the checkboxes to select/deselect months.
                </p>
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Photos</h3>
                
                {/* Upload Message */}
                {uploadMessage && (
                  <div className={`p-3 rounded-lg border ${
                    uploadMessage.type === 'success' 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {uploadMessage.type === 'success' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{uploadMessage.text}</span>
                    </div>
                  </div>
                )}

                {/* Upload Area */}
                <div className="upload-area">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    {isUploading ? (
                      <div>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm font-medium text-gray-900">Uploading...</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Click to upload photos or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          Supports JPG, PNG, GIF up to 20MB each
                        </p>
                        <div className="flex items-center justify-center space-x-1 text-xs text-blue-600">
                          <span>Images will be automatically sized for consistent display</span>
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                {/* Photo Gallery with Drag & Drop */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Photo Gallery</h4>
                      <p className="text-sm text-gray-600">
                        Drag to reorder • Click star to set cover photo
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedImages.map((imagePath, index) => (
                        <DraggablePhotoThumbnail
                          key={imagePath}
                          imagePath={imagePath}
                          index={index}
                          isCover={index === coverImageIndex}
                          isDragging={draggedIndex === index}
                          isDragOver={dragOverIndex === index}
                          onRemove={() => removeImage(imagePath)}
                          onSetCover={() => setCoverImage(index)}
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                        />
                      ))}
                    </div>
                    {uploadedImages.length > 0 && (
                      <div className="cover-photo-info">
                        <div className="flex items-start space-x-2">
                          <Star className="w-4 h-4 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-900">Cover Photo Selection</p>
                            <p className="text-blue-800">
                              The cover photo (marked with ⭐) will be used as the main thumbnail in lists and carousels. 
                              Drag images to reorder them in the gallery. All images are automatically sized for consistent display.
                            </p>
                            <p className="text-blue-800 mt-2 font-medium">
                              ✅ You can select a cover photo and continue editing all other fields - changes are only saved when you click the Save button.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Facts - Updated to use same input parameters as other fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Quick Facts</h3>
                <div className="form-field">
                  <label className="form-label">
                    Best Known For
                  </label>
                  <input
                    type="text"
                    value={formData.bestKnownFor}
                    onChange={(e) => handleFieldChange('bestKnownFor', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Beautiful beaches and Mediterranean cuisine"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">
                    Hidden Gem
                  </label>
                  <input
                    type="text"
                    value={formData.hiddenGem}
                    onChange={(e) => handleFieldChange('hiddenGem', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Secret viewpoint at Castle Hill"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">
                    Local Tip
                  </label>
                  <input
                    type="text"
                    value={formData.localTip}
                    onChange={(e) => handleFieldChange('localTip', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Visit early morning to avoid crowds"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="form-field">
                <label className="form-label">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  onBlur={handleTagsBlur}
                  className="form-input"
                  placeholder="e.g., Beach, Romantic, Historical (comma-separated)"
                />
                <p className="form-help-text">
                  Separate tags with commas. Tags will be automatically formatted to Title Case.
                </p>
              </div>

              {/* Notes - Updated to use same input parameters */}
              <div className="form-field">
                <label className="form-label">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  rows={4}
                  className="form-textarea"
                  placeholder="Add any thoughts, research notes, or details about this place..."
                />
              </div>
            </form>
          </div>

          {/* Submit Button - Fixed at bottom */}
          <div className="mobile-modal-footer">
            <div className="flex justify-end space-x-3">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={addPlace.isPending || updatePlace.isPending || selectedStatuses.length === 0}
                className="submit-button"
              >
                <Save className="w-4 h-4" />
                <span>
                  {addPlace.isPending || updatePlace.isPending 
                    ? (isEditing ? 'Updating...' : 'Adding...') 
                    : (isEditing ? 'Update Place' : 'Add Place')
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close month picker - Desktop only */}
      {showMonthPicker && (
        <div
          className="fixed inset-0 z-0 hidden md:block"
          onClick={handleMonthPickerClose}
        />
      )}
    </div>
  );
}

// Draggable Photo Thumbnail Component
function DraggablePhotoThumbnail({ 
  imagePath, 
  index,
  isCover,
  isDragging,
  isDragOver,
  onRemove, 
  onSetCover,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd
}: { 
  imagePath: string; 
  index: number;
  isCover: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onRemove: () => void;
  onSetCover: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const { data: imageUrl, isLoading } = useFileUrl(imagePath);

  if (isLoading) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
        <Camera className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`photo-thumbnail ${
        isDragging ? 'photo-thumbnail-dragging' : ''
      } ${
        isDragOver ? 'photo-thumbnail-drag-over' : ''
      }`}
    >
      <img
        src={imageUrl}
        alt="Place photo"
        className="w-full h-full object-cover object-center"
        draggable={false}
      />
      
      {/* Drag Handle */}
      <div className="photo-thumbnail-drag-handle">
        <GripVertical className="w-3 h-3" />
      </div>
      
      {/* Cover Star */}
      <button
        onClick={onSetCover}
        className={`photo-thumbnail-cover-button ${
          isCover 
            ? 'photo-thumbnail-cover-active' 
            : 'photo-thumbnail-cover-inactive'
        }`}
        title={isCover ? 'Cover photo' : 'Set as cover photo'}
      >
        <Star className={`w-3 h-3 ${isCover ? 'fill-current' : ''}`} />
      </button>
      
      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="photo-thumbnail-remove-button"
        title="Remove image"
      >
        <X className="w-3 h-3" />
      </button>
      
      {/* Cover Badge */}
      {isCover && (
        <div className="photo-thumbnail-cover-badge">
          Cover
        </div>
      )}
      
      {/* Order Number */}
      <div className="photo-thumbnail-order-number">
        #{index + 1}
      </div>
    </div>
  );
}
