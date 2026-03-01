import { type HttpAgentOptions, type ActorConfig, type Agent } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import { CreateActorOptions } from "declarations/backend";
import { _SERVICE } from "declarations/backend/backend.did.d.js";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_header {
    value: string;
    name: string;
}
export interface QuickFacts {
    bestKnownFor: string;
    hiddenGem: string;
    localTip: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array | number[];
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
export interface FileReference {
    hash: string;
    path: string;
}
export interface TransformationInput {
    context: Uint8Array | number[];
    response: http_request_result;
}
export interface Note {
    content: string;
    author: Principal;
    placeId: string;
    timestamp: Time;
}
export type Time = bigint;
export interface UserProfile {
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array | number[];
    headers: Array<http_header>;
}
export declare const createActor: (canisterId: string | Principal, options?: CreateActorOptions, processError?: (error: unknown) => never) => backendInterface;
export declare const canisterId: string;
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
    getAllPlaces(): Promise<Array<Place>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFileReference(path: string): Promise<FileReference>;
    getNotesForPlace(placeId: string): Promise<Array<Note>>;
    getPhoto(photoReference: string): Promise<string>;
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
    nearbySearch(lat: number, lon: number): Promise<string>;
    queryAutocomplete(input: string): Promise<string>;
    registerFileReference(path: string, hash: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchPlaces(term: string): Promise<Array<Place>>;
    textSearch(searchQuery: string): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}

