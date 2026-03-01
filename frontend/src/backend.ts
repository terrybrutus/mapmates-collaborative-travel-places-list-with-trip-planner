import { type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import { backend as _backend, createActor as _createActor, canisterId as _canisterId, CreateActorOptions } from "declarations/backend";
import { _SERVICE } from "declarations/backend/backend.did.d.js";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
function some<T>(value: T): Some<T> {
    return {
        __kind__: "Some",
        value: value
    };
}
function none(): None {
    return {
        __kind__: "None"
    };
}
function isNone<T>(option: Option<T>): option is None {
    return option.__kind__ === "None";
}
function isSome<T>(option: Option<T>): option is Some<T> {
    return option.__kind__ === "Some";
}
function unwrap<T>(option: Option<T>): T {
    if (isNone(option)) {
        throw new Error("unwrap: none");
    }
    return option.value;
}
function candid_some<T>(value: T): [T] {
    return [
        value
    ];
}
function candid_none<T>(): [] {
    return [];
}
function record_opt_to_undefined<T>(arg: T | null): T | undefined {
    return arg == null ? undefined : arg;
}
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
export function createActor(canisterId: string | Principal, options?: CreateActorOptions, processError?: (error: unknown) => never): backendInterface {
    const actor = _createActor(canisterId, options);
    return new Backend(actor, processError);
}
export const canisterId = _canisterId;
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
import type { BudgetRange as _BudgetRange, Place as _Place, PlaceStatus as _PlaceStatus, QuickFacts as _QuickFacts, Time as _Time, UserProfile as _UserProfile, UserRole as _UserRole } from "declarations/backend/backend.did.d.ts";
class Backend implements backendInterface {
    private actor: ActorSubclass<_SERVICE>;
    constructor(actor?: ActorSubclass<_SERVICE>, private processError?: (error: unknown) => never){
        this.actor = actor ?? _backend;
    }
    async addNote(arg0: Note): Promise<void> {
        if (this.processError) {
            try {
                const result = await this.actor.addNote(arg0);
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.addNote(arg0);
            return result;
        }
    }
    async addPlace(arg0: Place): Promise<void> {
        if (this.processError) {
            try {
                const result = await this.actor.addPlace(to_candid_Place_n1(arg0));
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.addPlace(to_candid_Place_n1(arg0));
            return result;
        }
    }
    async assignCallerUserRole(arg0: Principal, arg1: UserRole): Promise<void> {
        if (this.processError) {
            try {
                const result = await this.actor.assignCallerUserRole(arg0, to_candid_UserRole_n8(arg1));
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.assignCallerUserRole(arg0, to_candid_UserRole_n8(arg1));
            return result;
        }
    }
    async autocomplete(arg0: string): Promise<string> {
        if (this.processError) {
            try {
                const result = await this.actor.autocomplete(arg0);
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.autocomplete(arg0);
            return result;
        }
    }
    async deleteAllPlaces(): Promise<void> {
        if (this.processError) {
            try {
                const result = await this.actor.deleteAllPlaces();
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.deleteAllPlaces();
            return result;
        }
    }
    async deletePlace(arg0: string): Promise<void> {
        if (this.processError) {
            try {
                const result = await this.actor.deletePlace(arg0);
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.deletePlace(arg0);
            return result;
        }
    }
    async dropFileReference(arg0: string): Promise<void> {
        if (this.processError) {
            try {
                const result = await this.actor.dropFileReference(arg0);
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.dropFileReference(arg0);
            return result;
        }
    }
    async filterPlacesByCountry(arg0: string): Promise<Array<Place>> {
        if (this.processError) {
            try {
                const result = await this.actor.filterPlacesByCountry(arg0);
                return from_candid_vec_n10(result);
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.filterPlacesByCountry(arg0);
            return from_candid_vec_n10(result);
        }
    }
    async findPlaceFromText(arg0: string): Promise<string> {
        if (this.processError) {
            try {
                const result = await this.actor.findPlaceFromText(arg0);
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.findPlaceFromText(arg0);
            return result;
        }
    }
    async getAllPlaces(): Promise<Array<Place>> {
        if (this.processError) {
            try {
                const result = await this.actor.getAllPlaces();
                return from_candid_vec_n10(result);
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.getAllPlaces();
            return from_candid_vec_n10(result);
        }
    }
    async getCallerUserProfile(): Promise<UserProfile | null> {
        if (this.processError) {
            try {
                const result = await this.actor.getCallerUserProfile();
                return from_candid_opt_n18(result);
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.getCallerUserProfile();
            return from_candid_opt_n18(result);
        }
    }
    async getCallerUserRole(): Promise<UserRole> {
        if (this.processError) {
            try {
                const result = await this.actor.getCallerUserRole();
                return from_candid_UserRole_n19(result);
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.getCallerUserRole();
            return from_candid_UserRole_n19(result);
        }
    }
    async getFileReference(arg0: string): Promise<FileReference> {
        if (this.processError) {
            try {
                const result = await this.actor.getFileReference(arg0);
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.getFileReference(arg0);
            return result;
        }
    }
    async getNotesForPlace(arg0: string): Promise<Array<Note>> {
        if (this.processError) {
            try {
                const result = await this.actor.getNotesForPlace(arg0);
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.getNotesForPlace(arg0);
            return result;
        }
    }
    async getPhoto(arg0: string): Promise<string> {
        if (this.processError) {
            try {
                const result = await this.actor.getPhoto(arg0);
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.getPhoto(arg0);
            return result;
        }
    }
    async getPlace(arg0: string): Promise<Place | null> {
        if (this.processError) {
            try {
                const result = await this.actor.getPlace(arg0);
                return from_candid_opt_n21(result);
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.getPlace(arg0);
            return from_candid_opt_n21(result);
        }
    }
    async getPlaceDetails(arg0: string): Promise<string> {
        if (this.processError) {
            try {
                const result = await this.actor.getPlaceDetails(arg0);
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.getPlaceDetails(arg0);
            return result;
        }
    }
    async getRandomToResearchPlace(): Promise<Place | null> {
        if (this.processError) {
            try {
                const result = await this.actor.getRandomToResearchPlace();
                return from_candid_opt_n21(result);
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.getRandomToResearchPlace();
            return from_candid_opt_n21(result);
        }
    }
    async getStats(): Promise<{
        researchedPlaces: bigint;
        toResearchPlaces: bigint;
        totalPlaces: bigint;
    }> {
        if (this.processError) {
            try {
                const result = await this.actor.getStats();
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.getStats();
            return result;
        }
    }
    async getUserProfile(arg0: Principal): Promise<UserProfile | null> {
        if (this.processError) {
            try {
                const result = await this.actor.getUserProfile(arg0);
                return from_candid_opt_n18(result);
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.getUserProfile(arg0);
            return from_candid_opt_n18(result);
        }
    }
    async initializeAccessControl(): Promise<void> {
        if (this.processError) {
            try {
                const result = await this.actor.initializeAccessControl();
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.initializeAccessControl();
            return result;
        }
    }
    async isCallerAdmin(): Promise<boolean> {
        if (this.processError) {
            try {
                const result = await this.actor.isCallerAdmin();
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.isCallerAdmin();
            return result;
        }
    }
    async listFileReferences(): Promise<Array<FileReference>> {
        if (this.processError) {
            try {
                const result = await this.actor.listFileReferences();
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.listFileReferences();
            return result;
        }
    }
    async nearbySearch(arg0: number, arg1: number): Promise<string> {
        if (this.processError) {
            try {
                const result = await this.actor.nearbySearch(arg0, arg1);
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.nearbySearch(arg0, arg1);
            return result;
        }
    }
    async queryAutocomplete(arg0: string): Promise<string> {
        if (this.processError) {
            try {
                const result = await this.actor.queryAutocomplete(arg0);
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.queryAutocomplete(arg0);
            return result;
        }
    }
    async registerFileReference(arg0: string, arg1: string): Promise<void> {
        if (this.processError) {
            try {
                const result = await this.actor.registerFileReference(arg0, arg1);
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.registerFileReference(arg0, arg1);
            return result;
        }
    }
    async saveCallerUserProfile(arg0: UserProfile): Promise<void> {
        if (this.processError) {
            try {
                const result = await this.actor.saveCallerUserProfile(arg0);
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.saveCallerUserProfile(arg0);
            return result;
        }
    }
    async searchPlaces(arg0: string): Promise<Array<Place>> {
        if (this.processError) {
            try {
                const result = await this.actor.searchPlaces(arg0);
                return from_candid_vec_n10(result);
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.searchPlaces(arg0);
            return from_candid_vec_n10(result);
        }
    }
    async textSearch(arg0: string): Promise<string> {
        if (this.processError) {
            try {
                const result = await this.actor.textSearch(arg0);
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.textSearch(arg0);
            return result;
        }
    }
    async transform(arg0: TransformationInput): Promise<TransformationOutput> {
        if (this.processError) {
            try {
                const result = await this.actor.transform(arg0);
                return result;
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        } else {
            const result = await this.actor.transform(arg0);
            return result;
        }
    }
}
export const backend: backendInterface = new Backend();
function from_candid_BudgetRange_n16(value: _BudgetRange): BudgetRange {
    return from_candid_variant_n17(value);
}
function from_candid_PlaceStatus_n14(value: _PlaceStatus): PlaceStatus {
    return from_candid_variant_n15(value);
}
function from_candid_Place_n11(value: _Place): Place {
    return from_candid_record_n12(value);
}
function from_candid_UserRole_n19(value: _UserRole): UserRole {
    return from_candid_variant_n20(value);
}
function from_candid_opt_n18(value: [] | [_UserProfile]): UserProfile | null {
    return value.length === 0 ? null : value[0];
}
function from_candid_opt_n21(value: [] | [_Place]): Place | null {
    return value.length === 0 ? null : from_candid_Place_n11(value[0]);
}
function from_candid_record_n12(value: {
    id: string;
    status: Array<_PlaceStatus>;
    country: string;
    quickFacts: _QuickFacts;
    city: string;
    tags: Array<string>;
    bestTimeToVisit: string;
    attractions: Array<string>;
    author: Principal;
    stateRegion: string;
    notes: string;
    timestamp: _Time;
    budgetRange: _BudgetRange;
    images: Array<string>;
}): {
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
} {
    return {
        id: value.id,
        status: from_candid_vec_n13(value.status),
        country: value.country,
        quickFacts: value.quickFacts,
        city: value.city,
        tags: value.tags,
        bestTimeToVisit: value.bestTimeToVisit,
        attractions: value.attractions,
        author: value.author,
        stateRegion: value.stateRegion,
        notes: value.notes,
        timestamp: value.timestamp,
        budgetRange: from_candid_BudgetRange_n16(value.budgetRange),
        images: value.images
    };
}
function from_candid_variant_n15(value: {
    wouldReturn: null;
} | {
    wantToGo: null;
} | {
    researched: null;
} | {
    visited: null;
} | {
    toResearch: null;
} | {
    planning: null;
}): PlaceStatus {
    return "wouldReturn" in value ? PlaceStatus.wouldReturn : "wantToGo" in value ? PlaceStatus.wantToGo : "researched" in value ? PlaceStatus.researched : "visited" in value ? PlaceStatus.visited : "toResearch" in value ? PlaceStatus.toResearch : "planning" in value ? PlaceStatus.planning : value;
}
function from_candid_variant_n17(value: {
    low: null;
} | {
    high: null;
} | {
    medium: null;
}): BudgetRange {
    return "low" in value ? BudgetRange.low : "high" in value ? BudgetRange.high : "medium" in value ? BudgetRange.medium : value;
}
function from_candid_variant_n20(value: {
    admin: null;
} | {
    user: null;
} | {
    guest: null;
}): UserRole {
    return "admin" in value ? UserRole.admin : "user" in value ? UserRole.user : "guest" in value ? UserRole.guest : value;
}
function from_candid_vec_n10(value: Array<_Place>): Array<Place> {
    return value.map((x)=>from_candid_Place_n11(x));
}
function from_candid_vec_n13(value: Array<_PlaceStatus>): Array<PlaceStatus> {
    return value.map((x)=>from_candid_PlaceStatus_n14(x));
}
function to_candid_BudgetRange_n6(value: BudgetRange): _BudgetRange {
    return to_candid_variant_n7(value);
}
function to_candid_PlaceStatus_n4(value: PlaceStatus): _PlaceStatus {
    return to_candid_variant_n5(value);
}
function to_candid_Place_n1(value: Place): _Place {
    return to_candid_record_n2(value);
}
function to_candid_UserRole_n8(value: UserRole): _UserRole {
    return to_candid_variant_n9(value);
}
function to_candid_record_n2(value: {
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
}): {
    id: string;
    status: Array<_PlaceStatus>;
    country: string;
    quickFacts: _QuickFacts;
    city: string;
    tags: Array<string>;
    bestTimeToVisit: string;
    attractions: Array<string>;
    author: Principal;
    stateRegion: string;
    notes: string;
    timestamp: _Time;
    budgetRange: _BudgetRange;
    images: Array<string>;
} {
    return {
        id: value.id,
        status: to_candid_vec_n3(value.status),
        country: value.country,
        quickFacts: value.quickFacts,
        city: value.city,
        tags: value.tags,
        bestTimeToVisit: value.bestTimeToVisit,
        attractions: value.attractions,
        author: value.author,
        stateRegion: value.stateRegion,
        notes: value.notes,
        timestamp: value.timestamp,
        budgetRange: to_candid_BudgetRange_n6(value.budgetRange),
        images: value.images
    };
}
function to_candid_variant_n5(value: PlaceStatus): {
    wouldReturn: null;
} | {
    wantToGo: null;
} | {
    researched: null;
} | {
    visited: null;
} | {
    toResearch: null;
} | {
    planning: null;
} {
    return value == PlaceStatus.wouldReturn ? {
        wouldReturn: null
    } : value == PlaceStatus.wantToGo ? {
        wantToGo: null
    } : value == PlaceStatus.researched ? {
        researched: null
    } : value == PlaceStatus.visited ? {
        visited: null
    } : value == PlaceStatus.toResearch ? {
        toResearch: null
    } : value == PlaceStatus.planning ? {
        planning: null
    } : value;
}
function to_candid_variant_n7(value: BudgetRange): {
    low: null;
} | {
    high: null;
} | {
    medium: null;
} {
    return value == BudgetRange.low ? {
        low: null
    } : value == BudgetRange.high ? {
        high: null
    } : value == BudgetRange.medium ? {
        medium: null
    } : value;
}
function to_candid_variant_n9(value: UserRole): {
    admin: null;
} | {
    user: null;
} | {
    guest: null;
} {
    return value == UserRole.admin ? {
        admin: null
    } : value == UserRole.user ? {
        user: null
    } : value == UserRole.guest ? {
        guest: null
    } : value;
}
function to_candid_vec_n3(value: Array<PlaceStatus>): Array<_PlaceStatus> {
    return value.map((x)=>to_candid_PlaceStatus_n4(x));
}

