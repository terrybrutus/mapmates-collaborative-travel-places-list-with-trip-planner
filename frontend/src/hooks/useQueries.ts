import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Place, Note, UserProfile, PlaceStatus, BudgetRange } from '../backend';
import { Principal } from '@dfinity/principal';
import { getStandardCountryName } from '../utils/countryMapping';
import { formatPlaceData } from '../utils/textFormatting';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

// Helper function to get user profile by principal
export function useGetUserProfile(principal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

// Check if current user is admin (founder)
export function useIsAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// Get all users with their profiles - Simplified version for user tracking only
export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  const { data: places = [] } = useGetAllPlaces();

  return useQuery<Array<{ principal: Principal; profile: UserProfile | null; registrationTime?: number }>>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      
      // Collect all unique principals from places for comprehensive user tracking
      const allPrincipals = new Set<string>();
      const principalTimestamps = new Map<string, number>();
      
      // Get principals from places
      places.forEach(place => {
        const principalStr = place.author.toString();
        allPrincipals.add(principalStr);
        const timestamp = Number(place.timestamp) / 1000000;
        if (!principalTimestamps.has(principalStr) || timestamp < principalTimestamps.get(principalStr)!) {
          principalTimestamps.set(principalStr, timestamp);
        }
      });

      if (allPrincipals.size === 0) {
        return [];
      }

      // Convert to Principal objects and get their profiles
      const users = await Promise.all(
        Array.from(allPrincipals).map(async (principalStr) => {
          try {
            const principal = Principal.fromText(principalStr);
            const profile = await actor.getUserProfile(principal);
            
            return {
              principal,
              profile,
              registrationTime: principalTimestamps.get(principalStr)
            };
          } catch (error) {
            console.error(`Error processing user ${principalStr}:`, error);
            return null;
          }
        })
      );

      // Filter out null results and sort by registration time
      const validUsers = users.filter(user => user !== null) as Array<{ 
        principal: Principal; 
        profile: UserProfile | null; 
        registrationTime?: number;
      }>;

      return validUsers.sort((a, b) => {
        // Sort by registration time (earliest first), then by name
        if (a.registrationTime && b.registrationTime) {
          const timeComparison = a.registrationTime - b.registrationTime;
          if (timeComparison !== 0) return timeComparison;
        }
        
        // Finally sort by name
        const aName = a.profile?.name || 'Unknown User';
        const bName = b.profile?.name || 'Unknown User';
        return aName.localeCompare(bName);
      });
    },
    enabled: !!actor && !isFetching,
    staleTime: 5000, // Cache for 5 seconds to improve performance
    refetchInterval: 15000, // Refetch every 15 seconds for real-time updates
  });
}

// Places Queries
export function useGetAllPlaces() {
  const { actor, isFetching } = useActor();

  return useQuery<Place[]>({
    queryKey: ['places'],
    queryFn: async () => {
      if (!actor) return [];
      const places = await actor.getAllPlaces();
      // Apply formatting to all places when retrieved
      return places.map(place => formatPlaceData(place));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPlace() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (place: Place) => {
      if (!actor) throw new Error('Actor not available');
      // Ensure country is standardized and all text is formatted before saving
      const formattedPlace = formatPlaceData({
        ...place,
        country: getStandardCountryName(place.country)
      });
      return actor.addPlace(formattedPlace);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useUpdatePlace() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (place: Place) => {
      if (!actor) throw new Error('Actor not available');
      // Ensure country is standardized and all text is formatted before saving
      const formattedPlace = formatPlaceData({
        ...place,
        country: getStandardCountryName(place.country)
      });
      // Since backend doesn't have updatePlace, we'll use addPlace which should overwrite
      return actor.addPlace(formattedPlace);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeletePlace() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (placeId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePlace(placeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteAllPlaces() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAllPlaces();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useSearchPlaces() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (term: string) => {
      if (!actor) throw new Error('Actor not available');
      const places = await actor.searchPlaces(term);
      // Apply formatting to search results
      return places.map(place => formatPlaceData(place));
    },
  });
}

export function useFilterPlacesByCountry() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (country: string) => {
      if (!actor) throw new Error('Actor not available');
      // Standardize country name before filtering
      const standardizedCountry = getStandardCountryName(country);
      const places = await actor.filterPlacesByCountry(standardizedCountry);
      // Apply formatting to filtered results
      return places.map(place => formatPlaceData(place));
    },
  });
}

export function useGetRandomToResearchPlace() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const place = await actor.getRandomToResearchPlace();
      // Apply formatting to random place if it exists
      return place ? formatPlaceData(place) : null;
    },
  });
}

// Notes Queries
export function useGetNotesForPlace(placeId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Note[]>({
    queryKey: ['notes', placeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotesForPlace(placeId);
    },
    enabled: !!actor && !isFetching && !!placeId,
  });
}

export function useAddNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: Note) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addNote(note);
    },
    onSuccess: (_, note) => {
      queryClient.invalidateQueries({ queryKey: ['notes', note.placeId] });
    },
  });
}

// Statistics Queries
export function useGetStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}
