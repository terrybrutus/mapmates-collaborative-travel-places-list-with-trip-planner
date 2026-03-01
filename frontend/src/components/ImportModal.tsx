import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAddPlace } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Place, PlaceStatus, BudgetRange } from '../backend';
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader, Eye, EyeOff } from 'lucide-react';
import { getStandardCountryName } from '../utils/countryMapping';
import { formatPlaceData } from '../utils/textFormatting';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedPlace {
  id: string;
  country: string;
  stateRegion: string;
  city: string;
  notes: string;
  tags: string[];
  budgetRange: BudgetRange;
  bestTimeToVisit: string;
  quickFacts: {
    bestKnownFor: string;
    hiddenGem: string;
    localTip: string;
  };
  attractions: string[];
  blockNumber?: number;
  isValid: boolean;
  errors: string[];
}

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  duplicates: number;
  errors: string[];
}

export default function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const { identity } = useInternetIdentity();
  const addPlace = useAddPlace();
  
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [parsedPlaces, setParsedPlaces] = useState<ParsedPlace[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showBackdropBlur, setShowBackdropBlur] = useState(true);
  const [step, setStep] = useState<'input' | 'review' | 'importing' | 'complete'>('input');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Focus first element when modal opens
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard event handlers
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // File handling
  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = ['text/plain', 'application/pdf'];
    const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
    
    if (fileExtension === 'docx' || selectedFile.type.includes('wordprocessingml')) {
      alert('DOCX files are not supported. Please use TXT or PDF files only.');
      return;
    }
    
    if (!allowedTypes.includes(selectedFile.type) && !['txt', 'pdf'].includes(fileExtension || '')) {
      alert('Only TXT and PDF files are supported.');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // FTIT Parsing
  const parseFTITContent = (content: string): ParsedPlace[] => {
    const places: ParsedPlace[] = [];
    const blocks = content.split(/\n\s*\n/).filter(block => block.trim());
    
    blocks.forEach((block, blockIndex) => {
      const lines = block.split('\n').map(line => line.trim()).filter(line => line);
      if (lines.length === 0) return;

      const place: ParsedPlace = {
        id: `import-${Date.now()}-${blockIndex}`,
        country: '',
        stateRegion: '',
        city: '',
        notes: '',
        tags: [],
        budgetRange: BudgetRange.medium,
        bestTimeToVisit: '',
        quickFacts: {
          bestKnownFor: '',
          hiddenGem: '',
          localTip: '',
        },
        attractions: [],
        blockNumber: blockIndex + 1,
        isValid: true,
        errors: [],
      };

      let hasRequiredFields = false;

      lines.forEach(line => {
        // Skip comment lines
        if (line.startsWith('#')) return;

        // Parse field lines with || prefix
        if (line.startsWith('||')) {
          const fieldLine = line.substring(2).trim();
          const colonIndex = fieldLine.indexOf(':');
          
          if (colonIndex === -1) return;
          
          const fieldName = fieldLine.substring(0, colonIndex).trim().toLowerCase();
          const fieldValue = fieldLine.substring(colonIndex + 1).trim();
          
          if (!fieldValue) return;

          switch (fieldName) {
            case 'country':
              place.country = getStandardCountryName(fieldValue);
              hasRequiredFields = true;
              break;
            case 'state/region':
            case 'state':
            case 'region':
              place.stateRegion = fieldValue;
              break;
            case 'city':
            case 'city/town/village':
              place.city = fieldValue;
              hasRequiredFields = true;
              break;
            case 'notes':
              place.notes = fieldValue;
              break;
            case 'tags':
              place.tags = fieldValue.split(',').map(tag => tag.trim()).filter(tag => tag);
              break;
            case 'attractions':
            case 'attraction':
            case 'places':
            case 'neighborhoods':
              place.attractions = fieldValue.split(',').map(attraction => attraction.trim()).filter(attraction => attraction);
              break;
            case 'budget range':
            case 'budget':
              const budget = fieldValue.toLowerCase();
              if (budget.includes('low') || budget.includes('$')) {
                place.budgetRange = BudgetRange.low;
              } else if (budget.includes('high') || budget.includes('$$$')) {
                place.budgetRange = BudgetRange.high;
              } else {
                place.budgetRange = BudgetRange.medium;
              }
              break;
            case 'best time to visit':
            case 'best time':
              place.bestTimeToVisit = fieldValue;
              break;
            case 'best known for':
              place.quickFacts.bestKnownFor = fieldValue;
              break;
            case 'hidden gem':
              place.quickFacts.hiddenGem = fieldValue;
              break;
            case 'local tip':
              place.quickFacts.localTip = fieldValue;
              break;
          }
        }
      });

      // Validation
      if (!hasRequiredFields || !place.country || !place.city) {
        place.isValid = false;
        place.errors.push('Missing required fields: Country and City/Town/Village are mandatory');
      }

      if (place.country && place.city) {
        places.push(place);
      }
    });

    return places;
  };

  // Process content
  const processContent = async (content: string) => {
    setIsProcessing(true);
    try {
      const parsed = parseFTITContent(content);
      setParsedPlaces(parsed);
      
      // Auto-select valid places
      const validPlaceIds = new Set(parsed.filter(p => p.isValid).map(p => p.id));
      setSelectedPlaces(validPlaceIds);
      
      setStep('review');
    } catch (error) {
      console.error('Parsing error:', error);
      alert('Failed to parse content. Please check the format and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileProcess = async () => {
    if (!file) return;
    
    try {
      const content = await file.text();
      await processContent(content);
    } catch (error) {
      console.error('File processing error:', error);
      alert('Failed to read file. Please try again.');
    }
  };

  const handlePasteProcess = async () => {
    if (!pasteText.trim()) return;
    await processContent(pasteText);
  };

  // Import selected places
  const handleImport = async () => {
    if (!identity || selectedPlaces.size === 0) return;

    setStep('importing');
    setIsProcessing(true);

    const result: ImportResult = {
      success: false,
      imported: 0,
      failed: 0,
      duplicates: 0,
      errors: [],
    };

    try {
      const placesToImport = parsedPlaces.filter(p => selectedPlaces.has(p.id) && p.isValid);
      
      for (const parsedPlace of placesToImport) {
        try {
          const place: Place = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            country: parsedPlace.country,
            stateRegion: parsedPlace.stateRegion,
            city: parsedPlace.city,
            notes: parsedPlace.notes,
            status: [PlaceStatus.toResearch],
            tags: parsedPlace.tags,
            budgetRange: parsedPlace.budgetRange,
            bestTimeToVisit: parsedPlace.bestTimeToVisit,
            quickFacts: parsedPlace.quickFacts,
            images: [],
            author: identity.getPrincipal(),
            timestamp: BigInt(Date.now() * 1000000),
            attractions: parsedPlace.attractions,
          };

          const formattedPlace = formatPlaceData(place);
          await addPlace.mutateAsync(formattedPlace);
          result.imported++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Block ${parsedPlace.blockNumber}: ${error}`);
        }
      }

      result.success = result.imported > 0;
      setImportResult(result);
      setStep('complete');
    } catch (error) {
      console.error('Import error:', error);
      result.errors.push('Import process failed');
      setImportResult(result);
      setStep('complete');
    } finally {
      setIsProcessing(false);
    }
  };

  // Selection handlers
  const togglePlaceSelection = (placeId: string) => {
    const newSelection = new Set(selectedPlaces);
    if (newSelection.has(placeId)) {
      newSelection.delete(placeId);
    } else {
      newSelection.add(placeId);
    }
    setSelectedPlaces(newSelection);
  };

  const selectAll = () => {
    const validPlaceIds = new Set(parsedPlaces.filter(p => p.isValid).map(p => p.id));
    setSelectedPlaces(validPlaceIds);
  };

  const selectNone = () => {
    setSelectedPlaces(new Set());
  };

  // Reset modal
  const resetModal = () => {
    setMode('upload');
    setFile(null);
    setPasteText('');
    setParsedPlaces([]);
    setSelectedPlaces(new Set());
    setIsProcessing(false);
    setImportResult(null);
    setStep('input');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b flex-shrink-0 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Upload className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-gray-900">Import Places</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBackdropBlur(!showBackdropBlur)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={showBackdropBlur ? 'Disable backdrop blur' : 'Enable backdrop blur'}
                aria-label={showBackdropBlur ? 'Disable backdrop blur' : 'Enable backdrop blur'}
              >
                {showBackdropBlur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {step === 'input' && (
            <div className="space-y-6">
              {/* Mode Selection */}
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  ref={firstFocusableRef}
                  onClick={() => setMode('upload')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    mode === 'upload'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Upload className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Upload File</div>
                  <div className="text-sm text-gray-600">TXT or PDF files</div>
                </button>
                <button
                  onClick={() => setMode('paste')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    mode === 'paste'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Paste Text</div>
                  <div className="text-sm text-gray-600">Direct text input</div>
                </button>
              </div>

              {/* Upload Mode */}
              {mode === 'upload' && (
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-lg font-medium text-gray-900 mb-2">
                      Drop your file here or click to browse
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Supports TXT and PDF files. DOCX files will be rejected.
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.pdf"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) {
                          handleFileSelect(selectedFile);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Choose File
                    </button>
                  </div>

                  {file && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-green-900 truncate">{file.name}</div>
                          <div className="text-sm text-green-700">
                            {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleFileProcess}
                    disabled={!file || isProcessing}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      'Process File'
                    )}
                  </button>
                </div>
              )}

              {/* Paste Mode */}
              {mode === 'paste' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paste your FTIT formatted text
                    </label>
                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="|| Country: France&#10;|| City/Town/Village: Paris&#10;|| Attractions: Eiffel Tower, Louvre Museum&#10;|| Notes: Beautiful city with amazing architecture&#10;&#10;|| Country: Italy&#10;|| City/Town/Village: Rome&#10;|| Attractions: Colosseum, Vatican City&#10;|| Notes: Historic city with incredible landmarks"
                    />
                  </div>

                  <button
                    onClick={handlePasteProcess}
                    disabled={!pasteText.trim() || isProcessing}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      'Process Text'
                    )}
                  </button>
                </div>
              )}

              {/* Format Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">FTIT Format Requirements</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Each place should be in a separate block (separated by blank lines)</p>
                  <p>• Use <code className="bg-blue-100 px-1 rounded">|| Field: Value</code> format for each field</p>
                  <p>• Required fields: <strong>Country</strong> and <strong>City/Town/Village</strong></p>
                  <p>• Optional fields: State/Region, Attractions, Notes, Tags, Budget Range, Best Time to Visit, Best Known For, Hidden Gem, Local Tip</p>
                  <p>• Comments starting with # are ignored</p>
                </div>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  Review Parsed Places ({parsedPlaces.length} found)
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={selectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={selectNone}
                    className="text-sm text-gray-600 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Select None
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-700">
                    {parsedPlaces.filter(p => p.isValid).length}
                  </div>
                  <div className="text-sm text-green-600">Valid</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-red-700">
                    {parsedPlaces.filter(p => !p.isValid).length}
                  </div>
                  <div className="text-sm text-red-600">Invalid</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-700">
                    {selectedPlaces.size}
                  </div>
                  <div className="text-sm text-blue-600">Selected</div>
                </div>
              </div>

              {/* Places List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {parsedPlaces.map((place) => (
                  <div
                    key={place.id}
                    className={`border rounded-lg p-4 ${
                      place.isValid
                        ? selectedPlaces.has(place.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {place.isValid && (
                        <input
                          type="checkbox"
                          checked={selectedPlaces.has(place.id)}
                          onChange={() => togglePlaceSelection(place.id)}
                          className="mt-1 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {place.city}, {place.country}
                          </h4>
                          {place.blockNumber && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              Block {place.blockNumber}
                            </span>
                          )}
                          {!place.isValid && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                              Invalid
                            </span>
                          )}
                        </div>
                        
                        {place.stateRegion && (
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Region:</strong> {place.stateRegion}
                          </p>
                        )}
                        
                        {place.attractions.length > 0 && (
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Attractions:</strong> {place.attractions.join(', ')}
                          </p>
                        )}
                        
                        {place.notes && (
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Notes:</strong> {place.notes}
                          </p>
                        )}
                        
                        {place.tags.length > 0 && (
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Tags:</strong> {place.tags.join(', ')}
                          </p>
                        )}

                        {place.errors.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {place.errors.map((error, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setStep('input')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={selectedPlaces.size === 0}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Import {selectedPlaces.size} Place{selectedPlaces.size !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Importing Places...</h3>
              <p className="text-gray-600">Please wait while we process your selected places.</p>
              <button
                onClick={() => {
                  setIsProcessing(false);
                  setStep('review');
                }}
                className="mt-4 text-sm text-red-600 hover:text-red-700 px-4 py-2 rounded-md hover:bg-red-50 transition-colors"
              >
                Cancel Import
              </button>
            </div>
          )}

          {step === 'complete' && importResult && (
            <div className="space-y-6">
              <div className="text-center">
                {importResult.success ? (
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Import {importResult.success ? 'Completed' : 'Failed'}
                </h3>
              </div>

              {/* Results Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-700">
                    {importResult.imported}
                  </div>
                  <div className="text-sm text-green-600">Imported</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-red-700">
                    {importResult.failed}
                  </div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-yellow-700">
                    {importResult.duplicates}
                  </div>
                  <div className="text-sm text-yellow-600">Duplicates</div>
                </div>
              </div>

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Import Errors:</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">
                        • {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={resetModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Import More
                </button>
                <button
                  onClick={handleClose}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
