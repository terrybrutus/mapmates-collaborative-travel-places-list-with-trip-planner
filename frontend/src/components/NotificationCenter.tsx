import React, { useState, useMemo } from 'react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Bell, Settings, Check, X, Filter, User, MapPin, Calendar } from 'lucide-react';

// Mock notification data structure (in real app, this would come from backend)
interface Notification {
  id: string;
  type: 'place_added' | 'place_edited' | 'collaboration_invite';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  user?: string;
}

interface NotificationSettings {
  placeUpdates: boolean;
  collaborationInvites: boolean;
  weeklyDigest: boolean;
  emailNotifications: boolean;
}

export default function NotificationCenter() {
  const { data: userProfile } = useGetCallerUserProfile();
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'place'>('all');
  
  // Mock notification settings
  const [settings, setSettings] = useState<NotificationSettings>({
    placeUpdates: true,
    collaborationInvites: true,
    weeklyDigest: false,
    emailNotifications: false,
  });

  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'place_added',
      title: 'New place added',
      message: 'John added "Paris, France" to the places list',
      timestamp: Date.now() - 3600000, // 1 hour ago
      read: false,
      user: 'John',
    },
    {
      id: '3',
      type: 'place_edited',
      title: 'Place updated',
      message: 'Mike updated details for "Tokyo, Japan" with new photos and tips',
      timestamp: Date.now() - 86400000, // 1 day ago
      read: true,
      user: 'Mike',
    },
    {
      id: '4',
      type: 'collaboration_invite',
      title: 'Collaboration invite',
      message: 'You\'ve been invited to collaborate on place research',
      timestamp: Date.now() - 172800000, // 2 days ago
      read: false,
      user: 'Emma',
    },
  ]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    switch (filterType) {
      case 'unread':
        filtered = filtered.filter(n => !n.read);
        break;
      case 'place':
        filtered = filtered.filter(n => n.type === 'place_added' || n.type === 'place_edited');
        break;
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [notifications, filterType]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'place_added':
      case 'place_edited':
        return <MapPin className="w-5 h-5 text-blue-600" />;
      case 'collaboration_invite':
        return <User className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) {
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else {
      return 'Just now';
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'notifications'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeTab === 'notifications' ? (
        <>
          {/* Notification Controls */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread Only</option>
                  <option value="place">Place Updates</option>
                </select>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Filter className="w-4 h-4" />
                  <span>{filteredNotifications.length} notifications</span>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="divide-y">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-600">
                    {filterType === 'unread' 
                      ? "You're all caught up! No unread notifications."
                      : "You don't have any notifications yet."}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-blue-600 hover:text-blue-700"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Delete notification"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatTimeAgo(notification.timestamp)}</span>
                          </div>
                          {notification.user && (
                            <>
                              <span>•</span>
                              <span>by {notification.user}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        /* Settings Tab */
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Activity Notifications</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Place Updates</label>
                    <p className="text-sm text-gray-500">Get notified when places are added or edited</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.placeUpdates}
                      onChange={(e) => updateSetting('placeUpdates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Collaboration Invites</label>
                    <p className="text-sm text-gray-500">Get notified when invited to collaborate</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.collaborationInvites}
                      onChange={(e) => updateSetting('collaborationInvites', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">Digest & Email</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Weekly Digest</label>
                    <p className="text-sm text-gray-500">Receive a weekly summary of all activities</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.weeklyDigest}
                      onChange={(e) => updateSetting('weeklyDigest', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <p className="text-sm text-gray-500">Receive notifications via email (coming soon)</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer opacity-50">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                      disabled
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">Notification Tips</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Notifications help you stay updated on collaborative activities</li>
                      <li>• You can always adjust these settings based on your preferences</li>
                      <li>• Important notifications (like collaboration invites) are always shown</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
