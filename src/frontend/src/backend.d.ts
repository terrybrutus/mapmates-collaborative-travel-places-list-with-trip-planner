import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface QuickFacts {
    bestKnownFor: string;
    hiddenGem: string;
    localTip: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Place {
    id: string;
    status: Array<PlaceStatus>;
    country: string;
    quickFacts: QuickFacts;
    city: string;
    tags: Array<string>;
    bestTimeToVisit: string;
    attractions: Array<string>;
    author: Principal;
    stateRegion: string;
    notes: string;
    timestamp: Time;
    budgetRange: BudgetRange;
    images: Array<string>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface FileReference {
    hash: string;
    path: string;
}
export interface ActivityEntry {
    action: string;
    user: Principal;
    timestamp: Time;
}
export interface UserProfile {
    name: string;
}
export interface Note {
    content: string;
    author: Principal;
    placeId: string;
    timestamp: Time;
}
export enum BudgetRange {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum PlaceStatus {
    wouldReturn = "wouldReturn",
    wantToGo = "wantToGo",
    researched = "researched",
    visited = "visited",
    toResearch = "toResearch",
    planning = "planning"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addNote(note: Note): Promise<void>;
    addPlace(place: Place): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    autocomplete(input: string): Promise<string>;
    deleteAllPlaces(): Promise<void>;
    deletePlace(id: string): Promise<void>;
    dropFileReference(path: string): Promise<void>;
    filterPlacesByCountry(country: string): Promise<Array<Place>>;
    findPlaceFromText(input: string): Promise<string>;
    forgotPassword(email: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getActivityLog(): Promise<Array<ActivityEntry>>;
    getAllPlaces(): Promise<Array<Place>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFileReference(path: string): Promise<FileReference>;
    getLandingPageVideo(): Promise<{
        posterPath?: string;
        videoPath: string;
    } | null>;
    getNotesForPlace(placeId: string): Promise<Array<Note>>;
    getPlace(id: string): Promise<Place | null>;
    getPlaceDetails(placeId: string): Promise<string>;
    getRandomToResearchPlace(): Promise<Place | null>;
    getStats(): Promise<{
        researchedPlaces: bigint;
        toResearchPlaces: bigint;
        totalPlaces: bigint;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listFileReferences(): Promise<Array<FileReference>>;
    logUserSignup(): Promise<void>;
    loginUser(username: string, password: string): Promise<{
        __kind__: "ok";
        ok: {
            displayName: string;
            sessionToken: string;
            isAdmin: boolean;
        };
    } | {
        __kind__: "err";
        err: string;
    }>;
    logoutUser(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    nearbySearch(lat: number, lon: number): Promise<string>;
    queryAutocomplete(input: string): Promise<string>;
    register(username: string, password: string, email: string, displayName: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    registerFileReference(path: string, hash: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchPlaces(term: string): Promise<Array<Place>>;
    setLandingPageVideo(videoPath: string, posterPath: string | null): Promise<void>;
    textSearch(searchQuery: string): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updatePlace(place: Place): Promise<void>;
    validateSession(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: {
            username: string;
            displayName: string;
            isAdmin: boolean;
        };
    } | {
        __kind__: "err";
        err: string;
    }>;
    verifyEmail(token: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
