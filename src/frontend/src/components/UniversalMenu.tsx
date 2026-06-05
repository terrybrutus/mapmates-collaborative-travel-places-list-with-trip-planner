import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Download,
  Film,
  Settings,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useFileUpload } from "../blob-storage/FileStorage";
import {
  useDeleteAllPlaces,
  useGetAllPlaces,
  useGetLandingPageVideo,
  useIsAdmin,
  useSetLandingPageVideo,
} from "../hooks/useQueries";
import ExportPanel from "./ExportPanel";
import ImportModal from "./ImportModal";
import NotificationCenter from "./NotificationCenter";

interface UniversalMenuProps {
  onClose: () => void;
  placesCount: number;
}

function LandingVideoPanel({ onDone }: { onDone: () => void }) {
  const { data: currentVideo, isLoading } = useGetLandingPageVideo();
  const setLandingVideo = useSetLandingPageVideo();
  const { uploadFile, isUploading } = useFileUpload();

  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [posterUploadProgress, setPosterUploadProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setStatusMsg(null);

    try {
      const videoPath = `landing/video_${Date.now()}.mp4`;
      const { path } = await uploadFile(videoPath, file, (pct) =>
        setVideoUploadProgress(pct),
      );

      // Preserve existing poster if one is already set
      const posterPath = currentVideo?.posterPath ?? null;
      await setLandingVideo.mutateAsync({ videoPath: path, posterPath });
      setStatusMsg("Video uploaded and set as landing page background.");
      setVideoUploadProgress(0);
    } catch (err) {
      console.error("Video upload error:", err);
      setError("Failed to upload video. Please try again.");
      setVideoUploadProgress(0);
    }

    // Reset input
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setStatusMsg(null);

    if (!currentVideo?.videoPath) {
      setError("Upload a video first before adding a poster image.");
      return;
    }

    try {
      const posterPath = `landing/poster_${Date.now()}.jpg`;
      const { path } = await uploadFile(posterPath, file, (pct) =>
        setPosterUploadProgress(pct),
      );
      await setLandingVideo.mutateAsync({
        videoPath: currentVideo.videoPath,
        posterPath: path,
      });
      setStatusMsg("Poster image updated.");
      setPosterUploadProgress(0);
    } catch (err) {
      console.error("Poster upload error:", err);
      setError("Failed to upload poster. Please try again.");
      setPosterUploadProgress(0);
    }

    if (posterInputRef.current) posterInputRef.current.value = "";
  };

  const handleClearVideo = async () => {
    setError(null);
    try {
      // Setting an empty string as path effectively clears it in the backend
      // We use a sentinel "clear" operation by calling with empty paths
      await setLandingVideo.mutateAsync({ videoPath: "", posterPath: null });
      setStatusMsg("Landing page video removed. Gradient background restored.");
    } catch (err) {
      console.error("Clear video error:", err);
      setError("Failed to clear video. Please try again.");
    }
  };

  const isBusy = isUploading || setLandingVideo.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Film className="w-5 h-5 text-blue-600" />
          Landing Page Video
        </h2>
        <button
          type="button"
          onClick={onDone}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md"
          aria-label="Close"
          data-ocid="landing_video.close_button"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Current status */}
      {isLoading ? (
        <div className="text-sm text-gray-500 animate-pulse">
          Loading video status…
        </div>
      ) : currentVideo?.videoPath ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Video is set</p>
            <p className="text-xs text-green-600 mt-0.5">
              Landing page shows full-screen video background.
              {currentVideo.posterPath
                ? " Poster image configured."
                : " No poster image (optional)."}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            No video set. The landing page shows the animated gradient
            background.
          </p>
        </div>
      )}

      {/* Upload video */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-1">
          Upload Video{" "}
          <span className="text-gray-400 font-normal">(MP4 recommended)</span>
        </p>
        <label
          htmlFor="video-upload-input"
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer block"
          data-ocid="landing_video.upload_button"
        >
          <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            {isUploading && videoUploadProgress > 0
              ? `Uploading… ${videoUploadProgress}%`
              : "Click to upload video"}
          </p>
          <p className="text-xs text-gray-400 mt-1">MP4, MOV — up to 50MB</p>
          {isUploading && videoUploadProgress > 0 && (
            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${videoUploadProgress}%` }}
              />
            </div>
          )}
        </label>
        <input
          id="video-upload-input"
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/mov,video/*"
          className="hidden"
          onChange={handleVideoUpload}
          disabled={isBusy}
          data-ocid="landing_video.dropzone"
        />
      </div>

      {/* Upload poster */}
      {currentVideo?.videoPath && (
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">
            Poster Image{" "}
            <span className="text-gray-400 font-normal">
              (optional fallback for mobile)
            </span>
          </p>
          <label
            htmlFor="poster-upload-input"
            className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 transition-colors cursor-pointer block"
          >
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-600">
              {isUploading && posterUploadProgress > 0
                ? `Uploading… ${posterUploadProgress}%`
                : "Click to upload poster image"}
            </p>
            {isUploading && posterUploadProgress > 0 && (
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${posterUploadProgress}%` }}
                />
              </div>
            )}
          </label>
          <input
            id="poster-upload-input"
            ref={posterInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePosterUpload}
            disabled={isBusy}
          />
        </div>
      )}

      {/* Status messages */}
      {statusMsg && (
        <p
          className="text-sm text-green-700 bg-green-50 p-2 rounded-lg"
          data-ocid="landing_video.success_state"
        >
          ✓ {statusMsg}
        </p>
      )}
      {error && (
        <p
          className="text-sm text-red-700 bg-red-50 p-2 rounded-lg"
          data-ocid="landing_video.error_state"
        >
          {error}
        </p>
      )}

      {/* Clear video */}
      {currentVideo?.videoPath && (
        <button
          type="button"
          onClick={handleClearVideo}
          disabled={isBusy}
          className="w-full text-sm text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
          data-ocid="landing_video.delete_button"
        >
          Remove video (restore gradient background)
        </button>
      )}
    </div>
  );
}

export default function UniversalMenu({
  onClose,
  placesCount,
}: UniversalMenuProps) {
  const [activeSection, setActiveSection] = useState<
    "notifications" | "export" | "landingVideo" | null
  >(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const deleteAllPlaces = useDeleteAllPlaces();
  const { data: isAdmin = false } = useIsAdmin();

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeSection) {
          setActiveSection(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [activeSection, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleDeleteAllPlaces = async () => {
    try {
      await deleteAllPlaces.mutateAsync();
      setShowDeleteAllConfirm(false);
      onClose();
    } catch (error) {
      console.error("Failed to delete all places:", error);
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

  // Landing video panel — rendered inline in the menu panel
  if (activeSection === "landingVideo") {
    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30"
          onClick={() => setActiveSection(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setActiveSection(null);
          }}
          role="presentation"
          aria-hidden="true"
        />
        <div className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 bg-white shadow-2xl flex flex-col animate-slide-in">
          <div className="p-4 flex-shrink-0 bg-gray-50 border-b">
            <LandingVideoPanel onDone={() => setActiveSection(null)} />
          </div>
        </div>
      </>
    );
  }

  if (activeSection) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleOverlayClick}
        onKeyDown={(e) => {
          if (e.key === "Escape") setActiveSection(null);
        }}
        role="presentation"
      >
        <div
          className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-6 border-b flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {activeSection === "notifications" && "Notifications"}
              {activeSection === "export" && "Export Data"}
            </h2>
            <button
              type="button"
              onClick={() => setActiveSection(null)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close section"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {activeSection === "notifications" && <NotificationCenter />}
            {activeSection === "export" && <ExportPanel />}
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
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        role="presentation"
        aria-hidden="true"
      />

      {/* Menu Panel - Slides in from right */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 bg-white shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="p-4 border-b flex-shrink-0 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close menu"
              data-ocid="menu.close_button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* Notifications - Available to all users */}
          <button
            type="button"
            onClick={() => setActiveSection("notifications")}
            className="menu-item-button"
            aria-describedby="notifications-desc"
            data-ocid="menu.notifications_button"
          >
            <Bell className="menu-item-icon" />
            <div className="flex-1 text-left">
              <div className="menu-item-title">Notifications</div>
              <div className="menu-item-description" id="notifications-desc">
                View updates and activity
              </div>
            </div>
          </button>

          {/* Data Management Section */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center space-x-2 px-4 py-2">
              <Settings className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Data Management
              </span>
            </div>

            {/* Import - Admin only */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="menu-item-button"
                aria-describedby="import-desc"
                data-ocid="menu.import_button"
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
                type="button"
                onClick={() => setActiveSection("export")}
                className="menu-item-button"
                aria-describedby="export-desc"
                data-ocid="menu.export_button"
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

          {/* Admin Settings Section - Only for admin users */}
          {isAdmin && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center space-x-2 px-4 py-2">
                <Settings className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin Settings
                </span>
              </div>

              {/* Landing Page Video - Admin only */}
              <button
                type="button"
                onClick={() => setActiveSection("landingVideo")}
                className="menu-item-button"
                aria-describedby="landing-video-desc"
                data-ocid="menu.landing_video_button"
              >
                <Film className="menu-item-icon" />
                <div className="flex-1 text-left">
                  <div className="menu-item-title">Landing Page Video</div>
                  <div
                    className="menu-item-description"
                    id="landing-video-desc"
                  >
                    Upload or change the landing page background video
                  </div>
                </div>
              </button>

              {/* Delete All Places - Admin only */}
              {placesCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowDeleteAllConfirm(true)}
                  className="menu-item-button menu-item-button-danger"
                  aria-describedby="delete-all-desc"
                  data-ocid="menu.delete_all_button"
                >
                  <Trash2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-red-900">
                      Delete All Places
                    </div>
                    <div className="text-sm text-red-600" id="delete-all-desc">
                      Permanently remove all {placesCount} places
                    </div>
                  </div>
                </button>
              )}
            </div>
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
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteAllConfirm(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowDeleteAllConfirm(false);
          }}
          role="presentation"
        >
          <div
            className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900">
                Delete All Places
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete all {placesCount} places? This
              action cannot be undone and will permanently remove all travel
              destinations, notes, and associated data.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ This will delete ALL places for ALL users permanently!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                data-ocid="delete_all.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAllPlaces}
                disabled={deleteAllPlaces.isPending}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                data-ocid="delete_all.confirm_button"
              >
                {deleteAllPlaces.isPending
                  ? "Deleting..."
                  : `Delete All ${placesCount} Places`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
