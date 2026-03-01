export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Note = IDL.Record({
    'content' : IDL.Text,
    'author' : IDL.Principal,
    'placeId' : IDL.Text,
    'timestamp' : Time,
  });
  const PlaceStatus = IDL.Variant({
    'wouldReturn' : IDL.Null,
    'wantToGo' : IDL.Null,
    'researched' : IDL.Null,
    'visited' : IDL.Null,
    'toResearch' : IDL.Null,
    'planning' : IDL.Null,
  });
  const QuickFacts = IDL.Record({
    'bestKnownFor' : IDL.Text,
    'hiddenGem' : IDL.Text,
    'localTip' : IDL.Text,
  });
  const BudgetRange = IDL.Variant({
    'low' : IDL.Null,
    'high' : IDL.Null,
    'medium' : IDL.Null,
  });
  const Place = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Vec(PlaceStatus),
    'country' : IDL.Text,
    'quickFacts' : QuickFacts,
    'city' : IDL.Text,
    'tags' : IDL.Vec(IDL.Text),
    'bestTimeToVisit' : IDL.Text,
    'attractions' : IDL.Vec(IDL.Text),
    'author' : IDL.Principal,
    'stateRegion' : IDL.Text,
    'notes' : IDL.Text,
    'timestamp' : Time,
    'budgetRange' : BudgetRange,
    'images' : IDL.Vec(IDL.Text),
  });
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const UserProfile = IDL.Record({ 'name' : IDL.Text });
  const FileReference = IDL.Record({ 'hash' : IDL.Text, 'path' : IDL.Text });
  const http_header = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const http_request_result = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(http_header),
  });
  const TransformationInput = IDL.Record({
    'context' : IDL.Vec(IDL.Nat8),
    'response' : http_request_result,
  });
  const TransformationOutput = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(http_header),
  });
  return IDL.Service({
    'addNote' : IDL.Func([Note], [], []),
    'addPlace' : IDL.Func([Place], [], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'autocomplete' : IDL.Func([IDL.Text], [IDL.Text], []),
    'deleteAllPlaces' : IDL.Func([], [], []),
    'deletePlace' : IDL.Func([IDL.Text], [], []),
    'dropFileReference' : IDL.Func([IDL.Text], [], []),
    'filterPlacesByCountry' : IDL.Func([IDL.Text], [IDL.Vec(Place)], ['query']),
    'findPlaceFromText' : IDL.Func([IDL.Text], [IDL.Text], []),
    'getAllPlaces' : IDL.Func([], [IDL.Vec(Place)], ['query']),
    'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getFileReference' : IDL.Func([IDL.Text], [FileReference], ['query']),
    'getNotesForPlace' : IDL.Func([IDL.Text], [IDL.Vec(Note)], ['query']),
    'getPhoto' : IDL.Func([IDL.Text], [IDL.Text], []),
    'getPlace' : IDL.Func([IDL.Text], [IDL.Opt(Place)], ['query']),
    'getPlaceDetails' : IDL.Func([IDL.Text], [IDL.Text], []),
    'getRandomToResearchPlace' : IDL.Func([], [IDL.Opt(Place)], ['query']),
    'getStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'researchedPlaces' : IDL.Nat,
            'toResearchPlaces' : IDL.Nat,
            'totalPlaces' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getUserProfile' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(UserProfile)],
        ['query'],
      ),
    'initializeAccessControl' : IDL.Func([], [], []),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'listFileReferences' : IDL.Func([], [IDL.Vec(FileReference)], ['query']),
    'nearbySearch' : IDL.Func([IDL.Float64, IDL.Float64], [IDL.Text], []),
    'queryAutocomplete' : IDL.Func([IDL.Text], [IDL.Text], []),
    'registerFileReference' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
    'searchPlaces' : IDL.Func([IDL.Text], [IDL.Vec(Place)], ['query']),
    'textSearch' : IDL.Func([IDL.Text], [IDL.Text], []),
    'transform' : IDL.Func(
        [TransformationInput],
        [TransformationOutput],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
