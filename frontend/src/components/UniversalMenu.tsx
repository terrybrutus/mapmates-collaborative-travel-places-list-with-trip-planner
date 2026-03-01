import React, { useState, useEffect } from 'react';
import { useDeleteAllPlaces, useGetAllPlaces, useIsAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ExportPanel from './ExportPanel';
import NotificationCenter from './NotificationCenter';
import ImportModal from './ImportModal';
import { Download, X, Trash2, AlertTriangle, Bell, Settings, Plane, Route, Upload } from 'lucide-react';

interface UniversalMenuProps {
  onClose: () => void;
  placesCount: number;
  isAuthenticated: boolean;
}

export default function UniversalMenu({ 
  onClose, 
  placesCount, 
  isAuthenticated
}: UniversalMenuProps) {
  const [activeSection, setActiveSection] = useState<'notifications' | 'export' | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const deleteAllPlaces = useDeleteAllPlaces();
  const { data: isAdmin = false } = useIsAdmin();

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeSection) {
          setActiveSection(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [activeSection, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleDeleteAllPlaces = async () => {
    try {
      await deleteAllPlaces.mutateAsync();
      setShowDeleteAllConfirm(false);
      onClose();
    } catch (error) {
      console.error('Failed to delete all places:', error);
    }
  };

  // Handle overlay click to close sections/menu
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (activeSection) {
        setActiveSection(null);
      } else {
        onClose();
      }
    }
  };

  if (activeSection) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleOverlayClick}>
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 sm:p-6 border-b flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {activeSection === 'notifications' && 'Notifications'}
              {activeSection === 'export' && 'Export Data'}
            </h2>
            <button
              onClick={() => setActiveSection(null)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close section"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {activeSection === 'notifications' && <NotificationCenter />}
            {activeSection === 'export' && <ExportPanel />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop - Click to close */}
      <div 
        className="fixed inset-0 z-40 bg-black bg-opacity-30"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu Panel - Slides in from right */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 bg-white shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="p-4 border-b flex-shrink-0 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* Notifications - Available to all users */}
          <button
            onClick={() => setActiveSection('notifications')}
            className="menu-item-button"
            aria-describedby="notifications-desc"
          >
            <Bell className="menu-item-icon" />
            <div className="flex-1 text-left">
              <div className="menu-item-title">Notifications</div>
              <div className="menu-item-description" id="notifications-desc">
                View updates and activity
              </div>
            </div>
          </button>

          {/* Trip Planner Quick Access - Available to authenticated users */}
          {isAuthenticated && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center space-x-2 px-4 py-2">
                <Plane className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trip Planning</span>
              </div>

              <div className="menu-item-button opacity-60 cursor-not-allowed">
                <Route className="menu-item-icon" />
                <div className="flex-1 text-left">
                  <div className="menu-item-title">My Trips</div>
                  <div className="menu-item-description">
                    Quick access to your trips (use Trip Planner tab)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Management Section */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center space-x-2 px-4 py-2">
              <Settings className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Data Management</span>
            </div>

            {/* Import - Admin only */}
            {isAdmin && (
              <button
                onClick={() => setShowImportModal(true)}
                className="menu-item-button"
                aria-describedby="import-desc"
              >
                <Upload className="menu-item-icon" />
                <div className="flex-1 text-left">
                  <div className="menu-item-title">Import Places</div>
                  <div className="menu-item-description" id="import-desc">
                    Import places from TXT or PDF files
                  </div>
                </div>
              </button>
            )}

            {/* Export - Admin only */}
            {isAdmin && (
              <button
                onClick={() => setActiveSection('export')}
                className="menu-item-button"
                aria-describedby="export-desc"
              >
                <Download className="menu-item-icon" />
                <div className="flex-1 text-left">
                  <div className="menu-item-title">Export Data</div>
                  <div className="menu-item-description" id="export-desc">
                    Export places as TXT or CSV files
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Admin Settings Section - Only for authenticated users */}
          {isAuthenticated && (
            <>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2 px-4 py-2">
                  <Settings className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Settings</span>
                </div>

                {/* Delete All Places - Admin only */}
                {isAdmin && placesCount > 0 && (
                  <button
                    onClick={() => setShowDeleteAllConfirm(true)}
                    className="menu-item-button menu-item-button-danger"
                    aria-describedby="delete-all-desc"
                  >
                    <Trash2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-red-900">Delete All Places</div>
                      <div className="text-sm text-red-600" id="delete-all-desc">
                        Permanently remove all {placesCount} places
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
      />

      {/* Delete All Places Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowDeleteAllConfirm(false);
          }
        }}>
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900">Delete All Places</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete all {placesCount} places? This action cannot be undone and will permanently remove all travel destinations, notes, and associated data.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ This will delete ALL places for ALL users permanently!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllPlaces}
                disabled={deleteAllPlaces.isPending}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {deleteAllPlaces.isPending ? 'Deleting...' : `Delete All ${placesCount} Places`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
