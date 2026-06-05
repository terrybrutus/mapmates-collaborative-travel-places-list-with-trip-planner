import { useActor } from "@caffeineai/core-infrastructure";
import { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type BudgetRange,
  type Note,
  type Place,
  type PlaceStatus,
  type UserProfile,
  createActor,
} from "../backend";
import { useFileUrl } from "../blob-storage/FileStorage";
import { getStandardCountryName } from "../utils/countryMapping";
import { formatPlaceData } from "../utils/textFormatting";

export type { Place, Note, UserProfile, PlaceStatus, BudgetRange };

// Extended actor type that includes landing page video methods
// (these exist in the backend but may not yet be in the generated bindings)
interface ExtendedActor {
  getLandingPageVideo(): Promise<{
    videoPath: string;
    posterPath: string | null;
  } | null>;
  setLandingPageVideo(
    videoPath: string,
    posterPath: string | null,
  ): Promise<void>;
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor(createActor);

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
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
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

// Helper function to get user profile by principal
export function useGetUserProfile(principal: Principal | null) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

// Check if current user is admin (founder)
export function useIsAdmin() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<boolean>({
    queryKey: ["isAdmin"],
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
  const { actor, isFetching } = useActor(createActor);
  const { data: places = [] } = useGetAllPlaces();

  return useQuery<
    Array<{
      principal: Principal;
      profile: UserProfile | null;
      registrationTime?: number;
    }>
  >({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];

      // Collect all unique principals from places for comprehensive user tracking
      const allPrincipals = new Set<string>();
      const principalTimestamps = new Map<string, number>();

      // Get principals from places
      for (const place of places) {
        const principalStr = place.author.toString();
        allPrincipals.add(principalStr);
        const timestamp = Number(place.timestamp) / 1000000;
        if (
          !principalTimestamps.has(principalStr) ||
          timestamp < principalTimestamps.get(principalStr)!
        ) {
          principalTimestamps.set(principalStr, timestamp);
        }
      }

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
              registrationTime: principalTimestamps.get(principalStr),
            };
          } catch (error) {
            console.error(`Error processing user ${principalStr}:`, error);
            return null;
          }
        }),
      );

      // Filter out null results and sort by registration time
      const validUsers = users.filter((user) => user !== null) as Array<{
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
        const aName = a.profile?.name || "Unknown User";
        const bName = b.profile?.name || "Unknown User";
        return aName.localeCompare(bName);
      });
    },
    enabled: !!actor && !isFetching,
    staleTime: 5000,
    refetchInterval: 15000,
  });
}

// Places Queries
export function useGetAllPlaces() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Place[]>({
    queryKey: ["places"],
    queryFn: async () => {
      if (!actor) return [];
      const places = await actor.getAllPlaces();
      return places.map((place) => formatPlaceData(place));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPlace() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (place: Place) => {
      if (!actor) throw new Error("Actor not available");
      const formattedPlace = formatPlaceData({
        ...place,
        country: getStandardCountryName(place.country),
      });
      return actor.addPlace(formattedPlace);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useUpdatePlace() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (place: Place) => {
      if (!actor) throw new Error("Actor not available");
      const formattedPlace = formatPlaceData({
        ...place,
        country: getStandardCountryName(place.country),
      });
      return actor.addPlace(formattedPlace);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeletePlace() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (placeId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deletePlace(placeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteAllPlaces() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteAllPlaces();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useSearchPlaces() {
  const { actor } = useActor(createActor);

  return useMutation({
    mutationFn: async (term: string) => {
      if (!actor) throw new Error("Actor not available");
      const places = await actor.searchPlaces(term);
      return places.map((place) => formatPlaceData(place));
    },
  });
}

export function useFilterPlacesByCountry() {
  const { actor } = useActor(createActor);

  return useMutation({
    mutationFn: async (country: string) => {
      if (!actor) throw new Error("Actor not available");
      const standardizedCountry = getStandardCountryName(country);
      const places = await actor.filterPlacesByCountry(standardizedCountry);
      return places.map((place) => formatPlaceData(place));
    },
  });
}

export function useGetRandomToResearchPlace() {
  const { actor } = useActor(createActor);

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const place = await actor.getRandomToResearchPlace();
      return place ? formatPlaceData(place) : null;
    },
  });
}

// Notes Queries
export function useGetNotesForPlace(placeId: string) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Note[]>({
    queryKey: ["notes", placeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotesForPlace(placeId);
    },
    enabled: !!actor && !isFetching && !!placeId,
  });
}

export function useAddNote() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: Note) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addNote(note);
    },
    onSuccess: (_, note) => {
      queryClient.invalidateQueries({ queryKey: ["notes", note.placeId] });
    },
  });
}

// Statistics Queries
export function useGetStats() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// Landing Page Video Queries
export function useGetLandingPageVideo() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<{ videoPath: string; posterPath: string | null } | null>({
    queryKey: ["landingPageVideo"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const extActor = actor as unknown as ExtendedActor;
        const result = await extActor.getLandingPageVideo();
        return result ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60 * 1000,
  });
}

export function useSetLandingPageVideo() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      videoPath,
      posterPath,
    }: {
      videoPath: string;
      posterPath: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const extActor = actor as unknown as ExtendedActor;
      return extActor.setLandingPageVideo(videoPath, posterPath);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landingPageVideo"] });
    },
  });
}

/**
 * Safe composite hook for landing page video.
 * - Fetches the video path from backend (never throws)
 * - Resolves the path to a direct URL via FileStorage (never throws)
 * - Returns { videoUrl, posterUrl } — both may be undefined if unavailable
 */
export function useSafeLandingPageVideo(): {
  videoUrl: string | undefined;
  posterUrl: string | undefined;
} {
  const { data: videoData } = useGetLandingPageVideo();

  const videoPath = videoData?.videoPath ?? "";
  const posterPath = videoData?.posterPath ?? "";

  const { data: videoUrl } = useFileUrl(videoPath);
  const { data: posterUrl } = useFileUrl(posterPath);

  return {
    videoUrl: videoUrl ?? undefined,
    posterUrl: posterUrl ?? undefined,
  };
}
