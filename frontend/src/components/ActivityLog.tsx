import React, { useState, useMemo } from 'react';
import { useGetAllPlaces, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Place } from '../backend';
import { Activity, User, Calendar, MapPin, Edit, Trash2, Plus, Filter, Search, Info, ChevronDown, ChevronUp, UserPlus, Plane, Compass } from 'lucide-react';
import { Principal } from '@dfinity/principal';

// Real activity entry type based on actual user actions
interface ActivityEntry {
  user: Principal;
  action: string;
  timestamp: bigint;
}

// Component to display user name with fallback
function UserDisplayName({ principal }: { principal: Principal }) {
  const { data: userProfile } = useGetUserProfile(principal);
  
  if (userProfile?.name) {
    const principalStr = principal.toString();
    const partialId = `${principalStr.slice(0, 8)}...${principalStr.slice(-4)}`;
    return <span>{userProfile.name} ({partialId})</span>;
  }
  
  // Fallback to shortened principal
  const principalStr = principal.toString();
  return <span>User {principalStr.slice(0, 8)}...</span>;
}

interface GroupedActivity {
  user: string;
  userPrincipal: Principal;
  activities: ActivityEntry[];
  latestTimestamp: number;
  isExpanded: boolean;
}

export default function ActivityLog() {
  const { data: places = [] } = useGetAllPlaces();
  const { identity } = useInternetIdentity();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'signup' | 'place' | 'trip' | 'discovery'>('all');
  const [filterUser, setFilterUser] = useState('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Generate real activities based on actual places data
  const activities = useMemo(() => {
    const allActivities: ActivityEntry[] = [];
    
    // Add real activities based on places
    places.forEach((place) => {
      // Add creation activity
      allActivities.push({
        user: place.author,
        action: `Added place: ${place.city}, ${place.country}`,
        timestamp: place.timestamp,
      });
    });

    // Sort by timestamp (newest first)
    return allActivities.sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [places]);

  // Group activities by user
  const groupedActivities = useMemo(() => {
    const groups = new Map<string, GroupedActivity>();
    
    activities.forEach(activity => {
      const userId = activity.user.toString();
      if (!groups.has(userId)) {
        groups.set(userId, {
          user: userId,
          userPrincipal: activity.user,
          activities: [],
          latestTimestamp: Number(activity.timestamp),
          isExpanded: expandedGroups.has(userId),
        });
      }
      
      const group = groups.get(userId)!;
      group.activities.push(activity);
      
      // Update latest timestamp if this activity is more recent
      if (Number(activity.timestamp) > group.latestTimestamp) {
        group.latestTimestamp = Number(activity.timestamp);
      }
    });

    // Sort activities within each group by timestamp (newest first)
    groups.forEach(group => {
      group.activities.sort((a, b) => Number(b.timestamp - a.timestamp));
    });

    // Convert to array and sort by latest activity timestamp
    return Array.from(groups.values()).sort((a, b) => b.latestTimestamp - a.latestTimestamp);
  }, [activities, expandedGroups]);

  // Get unique users for filter
  const users = useMemo(() => {
    const uniquePrincipals = Array.from(new Set(activities.map(a => a.user.toString())));
    return uniquePrincipals;
  }, [activities]);

  // Filter grouped activities
  const filteredGroupedActivities = useMemo(() => {
    let filtered = groupedActivities;

    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.activities.some(activity =>
          activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.user.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (filterType !== 'all') {
      if (filterType === 'place') {
        filtered = filtered.filter(group =>
          group.activities.some(activity => 
            activity.action.toLowerCase().includes('place') ||
            activity.action.toLowerCase().includes('added') ||
            activity.action.toLowerCase().includes('updated')
          )
        );
      }
      // Other filter types would be implemented when those features are added
    }

    if (filterUser !== 'all') {
      filtered = filtered.filter(group => group.user === filterUser);
    }

    return filtered;
  }, [groupedActivities, searchTerm, filterType, filterUser]);

  const toggleGroupExpansion = (userId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedGroups(newExpanded);
  };

  const getActivityIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('added') || actionLower.includes('add')) {
      return <Plus className="w-4 h-4 text-green-600" />;
    } else if (actionLower.includes('updated') || actionLower.includes('edit')) {
      return <Edit className="w-4 h-4 text-blue-600" />;
    } else if (actionLower.includes('deleted') || actionLower.includes('delete')) {
      return <Trash2 className="w-4 h-4 text-red-600" />;
    } else {
      return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('added') || actionLower.includes('add')) {
      return 'bg-green-50 border-green-200';
    } else if (actionLower.includes('updated') || actionLower.includes('edit')) {
      return 'bg-blue-50 border-blue-200';
    } else if (actionLower.includes('deleted') || actionLower.includes('delete')) {
      return 'bg-red-50 border-red-200';
    } else {
      return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - (timestamp / 1000000); // Convert nanoseconds to milliseconds
    
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

  const getTotalActivitiesCount = () => {
    return filteredGroupedActivities.reduce((total, group) => total + group.activities.length, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header with Public Access Notice */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
        </div>
        
        {/* Public Access Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Real Activity Tracking</h3>
              <p className="text-sm text-blue-800">
                This activity log shows real user actions based on actual place additions and modifications. 
                Activities are grouped by user and ordered by recency. User names with partial principal IDs are displayed for transparency and user identification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Enhanced Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Activities</option>
            <option value="place">Place Activities</option>
          </select>

          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Users</option>
            {users.map(user => (
              <option key={user} value={user}>
                {user.slice(0, 8)}...
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>{getTotalActivitiesCount()} activities</span>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Places Added</p>
              <p className="text-xl font-bold text-gray-900">
                {activities.filter(a => a.action.toLowerCase().includes('added place')).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-xl font-bold text-gray-900">{filteredGroupedActivities.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-xl font-bold text-gray-900">{activities.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Activity Timeline */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity (Grouped by User)</h3>
          <p className="text-sm text-gray-600 mt-1">
            Real activity tracking based on actual user actions. Activities are grouped by user and ordered by most recent activity. 
            Click to expand individual actions.
          </p>
        </div>
        
        <div className="divide-y">
          {filteredGroupedActivities.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {activities.length === 0 ? (
                <>
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
                  <p className="text-gray-600">
                    Start adding places to see activity here. All user actions will be tracked and displayed.
                  </p>
                </>
              ) : (
                'No activities match your current filters.'
              )}
            </div>
          ) : (
            filteredGroupedActivities.map((group) => (
              <div key={group.user} className="hover:bg-gray-50 transition-colors">
                {/* Group Header */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleGroupExpansion(group.user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          <UserDisplayName principal={group.userPrincipal} />
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {group.activities.length} activit{group.activities.length === 1 ? 'y' : 'ies'}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(group.latestTimestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Activity type indicators */}
                      <div className="flex space-x-1">
                        <div className="p-1 rounded border bg-green-50 border-green-200">
                          <MapPin className="w-3 h-3 text-green-600" />
                        </div>
                      </div>
                      {expandedGroups.has(group.user) ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Preview of latest activity when collapsed */}
                  {!expandedGroups.has(group.user) && group.activities.length > 0 && (
                    <div className="mt-2 ml-9 text-sm text-gray-600">
                      Latest: {group.activities[0].action}
                      {group.activities.length > 1 && (
                        <span className="ml-2 text-gray-500">
                          and {group.activities.length - 1} other activit{group.activities.length - 1 === 1 ? 'y' : 'ies'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Expanded Activities */}
                {expandedGroups.has(group.user) && (
                  <div className="bg-gray-50 border-t">
                    {group.activities.map((activity, index) => (
                      <div key={index} className="p-4 ml-4 border-l-2 border-gray-200">
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-lg border ${getActivityColor(activity.action)}`}>
                            {getActivityIcon(activity.action)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {activity.action}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatTimeAgo(Number(activity.timestamp))}</span>
                              </div>
                              <span>•</span>
                              <span>{new Date(Number(activity.timestamp) / 1000000).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Activity Insights */}
      {filteredGroupedActivities.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Insights</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Most Active Contributors</h4>
              <div className="space-y-2">
                {filteredGroupedActivities.slice(0, 5).map((group, index) => (
                  <div key={group.user} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        <UserDisplayName principal={group.userPrincipal} />
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {group.activities.length} activities
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Activity Breakdown</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Place activities</span>
                  <span className="text-sm font-medium text-gray-900">
                    {activities.filter(a => a.action.toLowerCase().includes('place')).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total activities</span>
                  <span className="text-sm font-medium text-gray-900">
                    {activities.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
