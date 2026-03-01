import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type BudgetRange = { 'low' : null } |
  { 'high' : null } |
  { 'medium' : null };
export interface FileReference { 'hash' : string, 'path' : string }
export interface Note {
  'content' : string,
  'author' : Principal,
  'placeId' : string,
  'timestamp' : Time,
}
export interface Place {
  'id' : string,
  'status' : Array<PlaceStatus>,
  'country' : string,
  'quickFacts' : QuickFacts,
  'city' : string,
  'tags' : Array<string>,
  'bestTimeToVisit' : string,
  'attractions' : Array<string>,
  'author' : Principal,
  'stateRegion' : string,
  'notes' : string,
  'timestamp' : Time,
  'budgetRange' : BudgetRange,
  'images' : Array<string>,
}
export type PlaceStatus = { 'wouldReturn' : null } |
  { 'wantToGo' : null } |
  { 'researched' : null } |
  { 'visited' : null } |
  { 'toResearch' : null } |
  { 'planning' : null };
export interface QuickFacts {
  'bestKnownFor' : string,
  'hiddenGem' : string,
  'localTip' : string,
}
export type Time = bigint;
export interface TransformationInput {
  'context' : Uint8Array | number[],
  'response' : http_request_result,
}
export interface TransformationOutput {
  'status' : bigint,
  'body' : Uint8Array | number[],
  'headers' : Array<http_header>,
}
export interface UserProfile { 'name' : string }
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface http_header { 'value' : string, 'name' : string }
export interface http_request_result {
  'status' : bigint,
  'body' : Uint8Array | number[],
  'headers' : Array<http_header>,
}
export interface _SERVICE {
  'addNote' : ActorMethod<[Note], undefined>,
  'addPlace' : ActorMethod<[Place], undefined>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'autocomplete' : ActorMethod<[string], string>,
  'deleteAllPlaces' : ActorMethod<[], undefined>,
  'deletePlace' : ActorMethod<[string], undefined>,
  'dropFileReference' : ActorMethod<[string], undefined>,
  'filterPlacesByCountry' : ActorMethod<[string], Array<Place>>,
  'findPlaceFromText' : ActorMethod<[string], string>,
  'getAllPlaces' : ActorMethod<[], Array<Place>>,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getFileReference' : ActorMethod<[string], FileReference>,
  'getNotesForPlace' : ActorMethod<[string], Array<Note>>,
  'getPhoto' : ActorMethod<[string], string>,
  'getPlace' : ActorMethod<[string], [] | [Place]>,
  'getPlaceDetails' : ActorMethod<[string], string>,
  'getRandomToResearchPlace' : ActorMethod<[], [] | [Place]>,
  'getStats' : ActorMethod<
    [],
    {
      'researchedPlaces' : bigint,
      'toResearchPlaces' : bigint,
      'totalPlaces' : bigint,
    }
  >,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'initializeAccessControl' : ActorMethod<[], undefined>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'listFileReferences' : ActorMethod<[], Array<FileReference>>,
  'nearbySearch' : ActorMethod<[number, number], string>,
  'queryAutocomplete' : ActorMethod<[string], string>,
  'registerFileReference' : ActorMethod<[string, string], undefined>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
  'searchPlaces' : ActorMethod<[string], Array<Place>>,
  'textSearch' : ActorMethod<[string], string>,
  'transform' : ActorMethod<[TransformationInput], TransformationOutput>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
