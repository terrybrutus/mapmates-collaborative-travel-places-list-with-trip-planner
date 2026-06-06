import {
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit,
  Filter,
  Info,
  MapPin,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { type ActivityEntry, useGetActivityLog } from "../hooks/useQueries";

interface GroupedActivity {
  username: string;
  activities: ActivityEntry[];
  latestTimestamp: number;
}

export default function ActivityLog() {
  const { data: activities = [], isLoading } = useGetActivityLog();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "place" | "trip" | "signup">("all");
  const [filterUser, setFilterUser] = useState("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const groupedActivities = useMemo(() => {
    const groups = new Map<string, GroupedActivity>();
    for (const activity of activities) {
      if (!groups.has(activity.username)) {
        groups.set(activity.username, {
          username: activity.username,
          activities: [],
          latestTimestamp: activity.timestamp,
        });
      }
      const group = groups.get(activity.username)!;
      group.activities.push(activity);
      if (activity.timestamp > group.latestTimestamp) {
        group.latestTimestamp = activity.timestamp;
      }
    }
    for (const group of groups.values()) {
      group.activities.sort((a, b) => b.timestamp - a.timestamp);
    }
    return Array.from(groups.values()).sort((a, b) => b.latestTimestamp - a.latestTimestamp);
  }, [activities]);

  const users = useMemo(() => Array.from(new Set(activities.map((a) => a.username))), [activities]);

  const filteredGroups = useMemo(() => {
    let filtered = groupedActivities;
    if (searchTerm) {
      filtered = filtered.filter((g) =>
        g.activities.some(
          (a) =>
            a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.username.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }
    if (filterType !== "all") {
      filtered = filtered.filter((g) =>
        g.activities.some((a) => {
          const lower = a.action.toLowerCase();
          if (filterType === "place") return lower.includes("place");
          if (filterType === "trip") return lower.includes("trip");
          if (filterType === "signup") return lower.includes("signed up");
          return true;
        }),
      );
    }
    if (filterUser !== "all") {
      filtered = filtered.filter((g) => g.username === filterUser);
    }
    return filtered;
  }, [groupedActivities, searchTerm, filterType, filterUser]);

  const toggleGroup = (username: string) => {
    const next = new Set(expandedGroups);
    if (next.has(username)) next.delete(username);
    else next.add(username);
    setExpandedGroups(next);
  };

  const getActivityIcon = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes("added") || lower.includes("signed up")) return <Plus className="w-4 h-4 text-green-600" />;
    if (lower.includes("updated") || lower.includes("edit")) return <Edit className="w-4 h-4 text-blue-600" />;
    if (lower.includes("deleted") || lower.includes("delete")) return <Trash2 className="w-4 h-4 text-red-600" />;
    if (lower.includes("trip")) return <MapPin className="w-4 h-4 text-purple-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const getActivityColor = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes("added") || lower.includes("signed up")) return "bg-green-50 border-green-200";
    if (lower.includes("updated") || lower.includes("edit")) return "bg-blue-50 border-blue-200";
    if (lower.includes("deleted") || lower.includes("delete")) return "bg-red-50 border-red-200";
    if (lower.includes("trip")) return "bg-purple-50 border-purple-200";
    return "bg-gray-50 border-gray-200";
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp / 1_000_000;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const totalCount = filteredGroups.reduce((n, g) => n + g.activities.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Activity className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
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
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Activities</option>
            <option value="place">Place Activities</option>
            <option value="trip">Trip Activities</option>
            <option value="signup">Sign-ups</option>
          </select>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Users</option>
            {users.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>{totalCount} activities</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Places Added</p>
              <p className="text-xl font-bold text-gray-900">
                {activities.filter((a) => a.action.toLowerCase().includes("added place")).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-xl font-bold text-gray-900">{filteredGroups.length}</p>
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

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-600 mt-1">Grouped by user, ordered by most recent.</p>
        </div>
        <div className="divide-y">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Loading activity...</div>
          ) : filteredGroups.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
              <p className="text-gray-600">
                {activities.length === 0
                  ? "Activity will appear here as users sign up and interact with the app."
                  : "No activities match your current filters."}
              </p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.username} className="hover:bg-gray-50 transition-colors">
                <button
                  type="button"
                  className="p-4 cursor-pointer w-full text-left"
                  onClick={() => toggleGroup(group.username)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-500" />
                        <span className="font-medium text-gray-900">{group.username}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {group.activities.length} activit{group.activities.length === 1 ? "y" : "ies"} •{" "}
                        {formatTimeAgo(group.latestTimestamp)}
                      </span>
                    </div>
                    {expandedGroups.has(group.username) ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  {!expandedGroups.has(group.username) && group.activities.length > 0 && (
                    <div className="mt-2 ml-7 text-sm text-gray-600">
                      Latest: {group.activities[0].action}
                    </div>
                  )}
                </button>
                {expandedGroups.has(group.username) && (
                  <div className="bg-gray-50 border-t">
                    {group.activities.map((activity) => (
                      <div
                        key={`${activity.username}-${activity.timestamp}`}
                        className="p-4 ml-4 border-l-2 border-gray-200"
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-lg border ${getActivityColor(activity.action)}`}>
                            {getActivityIcon(activity.action)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatTimeAgo(activity.timestamp)}</span>
                              <span>•</span>
                              <span>{new Date(activity.timestamp / 1_000_000).toLocaleDateString()}</span>
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
    </div>
  );
}
