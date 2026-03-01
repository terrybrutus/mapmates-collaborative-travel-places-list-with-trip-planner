import Cycles "mo:base/ExperimentalCycles";
import Nat "mo:base/Nat";
import OrderedMap "mo:base/OrderedMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Registry "blob-storage/registry";
import Iter "mo:base/Iter";
import Int "mo:base/Int";
import Char "mo:base/Char";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import Float "mo:base/Float";




persistent actor Main {
    
    public type Place = {
        id : Text;
        country : Text;
        stateRegion : Text;
        city : Text;
        notes : Text;
        status : [PlaceStatus];
        tags : [Text];
        budgetRange : BudgetRange;
        bestTimeToVisit : Text;
        quickFacts : QuickFacts;
        images : [Text];
        author : Principal;
        timestamp : Time.Time;
        attractions : [Text];
    };

    public type PlaceStatus = {
        #toResearch;
        #researched;
        #wantToGo;
        #planning;
        #visited;
        #wouldReturn;
    };

    public type BudgetRange = {
        #low;
        #medium;
        #high;
    };

    public type QuickFacts = {
        bestKnownFor : Text;
        hiddenGem : Text;
        localTip : Text;
    };

    public type Note = {
        placeId : Text;
        content : Text;
        author : Principal;
        timestamp : Time.Time;
    };

    public type UserProfile = {
        name : Text;
        
    };

    
    let accessControlState = AccessControl.initState();

    transient let textMap = OrderedMap.Make<Text>(Text.compare);
    transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);

    var places = textMap.empty<Place>();
    var notes = textMap.empty<Note>();
    var userProfiles = principalMap.empty<UserProfile>();

    
    let registry = Registry.new();

    
    public shared ({ caller }) func initializeAccessControl() : async () {
        AccessControl.initialize(accessControlState, caller);
    };

    public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
        AccessControl.getUserRole(accessControlState, caller);
    };

    public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
        AccessControl.assignRole(accessControlState, caller, user, role);
    };

    public query ({ caller }) func isCallerAdmin() : async Bool {
        AccessControl.isAdmin(accessControlState, caller);
    };

    
    public shared ({ caller }) func addPlace(place : Place) : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
            Debug.trap("Unauthorized: Only users can add places");
        };
        places := textMap.put(places, place.id, place);
    };

    public query func getPlace(id : Text) : async ?Place {
        textMap.get(places, id);
    };

    public query func getAllPlaces() : async [Place] {
        Iter.toArray(textMap.vals(places));
    };

    public shared ({ caller }) func deletePlace(id : Text) : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
            Debug.trap("Unauthorized: Only users can delete places");
        };
        places := textMap.delete(places, id);
    };

    public shared ({ caller }) func deleteAllPlaces() : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
            Debug.trap("Unauthorized: Only admins can delete all places");
        };
        places := textMap.empty();
    };

    
    public shared ({ caller }) func addNote(note : Note) : async () {
        if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
            Debug.trap("Unauthorized: Only users can add notes");
        };
        notes := textMap.put(notes, note.placeId, note);
    };

    public query func getNotesForPlace(placeId : Text) : async [Note] {
        let filtered = List.filter<Note>(
            List.fromArray(Iter.toArray(textMap.vals(notes))),
            func(n : Note) : Bool { n.placeId == placeId },
        );
        List.toArray(filtered);
    };

    
    public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
        principalMap.get(userProfiles, caller);
    };

    public query func getUserProfile(user : Principal) : async ?UserProfile {
        principalMap.get(userProfiles, user);
    };

    public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
        userProfiles := principalMap.put(userProfiles, caller, profile);
    };

    
    public func registerFileReference(path : Text, hash : Text) : async () {
        Registry.add(registry, path, hash);
    };

    public query func getFileReference(path : Text) : async Registry.FileReference {
        Registry.get(registry, path);
    };

    public query func listFileReferences() : async [Registry.FileReference] {
        Registry.list(registry);
    };

    public func dropFileReference(path : Text) : async () {
        Registry.remove(registry, path);
    };

    
    public query func filterPlacesByCountry(country : Text) : async [Place] {
        let filtered = List.filter<Place>(
            List.fromArray(Iter.toArray(textMap.vals(places))),
            func(p : Place) : Bool { p.country == country },
        );
        List.toArray(filtered);
    };

    
    func normalizeText(t : Text) : Text {
        let chars = List.fromArray(Text.toArray(t));
        let filtered = List.filter<Char>(
            chars,
            func(c : Char) : Bool {
                not Char.isWhitespace(c) and not Char.isDigit(c)
            },
        );
        Text.fromIter(List.toIter(filtered));
    };

    public query func searchPlaces(term : Text) : async [Place] {
        let normalizedTerm = normalizeText(term);
        let filtered = List.filter<Place>(
            List.fromArray(Iter.toArray(textMap.vals(places))),
            func(p : Place) : Bool {
                let normalizedCountry = normalizeText(p.country);
                let normalizedCity = normalizeText(p.city);
                let normalizedNotes = normalizeText(p.notes);
                Text.contains(normalizedCountry, #text normalizedTerm) or Text.contains(normalizedCity, #text normalizedTerm) or Text.contains(normalizedNotes, #text normalizedTerm);
            },
        );
        List.toArray(filtered);
    };

    
    public query func getRandomToResearchPlace() : async ?Place {
        let toResearch = List.filter<Place>(
            List.fromArray(Iter.toArray(textMap.vals(places))),
            func(p : Place) : Bool {
                List.some<PlaceStatus>(
                    List.fromArray(p.status),
                    func(s : PlaceStatus) : Bool { s == #toResearch },
                );
            },
        );
        let size = List.size(toResearch);
        if (size == 0) {
            return null;
        };
        let index = Int.abs(Time.now() % (size : Int));
        List.get(toResearch, index);
    };

    
    public query func getStats() : async {
        totalPlaces : Nat;
        researchedPlaces : Nat;
        toResearchPlaces : Nat;
    } {
        let allPlaces = Iter.toArray(textMap.vals(places));
        let researched = List.filter<Place>(
            List.fromArray(allPlaces),
            func(p : Place) : Bool {
                List.some<PlaceStatus>(
                    List.fromArray(p.status),
                    func(s : PlaceStatus) : Bool { s == #researched },
                );
            },
        );
        let toResearch = List.filter<Place>(
            List.fromArray(allPlaces),
            func(p : Place) : Bool {
                List.some<PlaceStatus>(
                    List.fromArray(p.status),
                    func(s : PlaceStatus) : Bool { s == #toResearch },
                );
            },
        );

        {
            totalPlaces = allPlaces.size();
            researchedPlaces = List.size(researched);
            toResearchPlaces = List.size(toResearch);
        };
    };

    
    public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
        OutCall.transform(input);
    };

    public func getPlaceDetails(placeId : Text) : async Text {
        let url = "https:
        await OutCall.httpGetRequest(
            url,
            [
                { name = "X-RapidAPI-Host"; value = "maps-places.p.rapidapi.com" },
                { name = "X-RapidAPI-Key"; value = "YOUR_RAPIDAPI_KEY" },
            ],
            transform,
        );
    };

    public func textSearch(searchQuery : Text) : async Text {
        let url = "https:
        await OutCall.httpGetRequest(
            url,
            [
                { name = "X-RapidAPI-Host"; value = "maps-places.p.rapidapi.com" },
                { name = "X-RapidAPI-Key"; value = "YOUR_RAPIDAPI_KEY" },
            ],
            transform,
        );
    };

    public func findPlaceFromText(input : Text) : async Text {
        let url = "https:
        await OutCall.httpGetRequest(
            url,
            [
                { name = "X-RapidAPI-Host"; value = "maps-places.p.rapidapi.com" },
                { name = "X-RapidAPI-Key"; value = "YOUR_RAPIDAPI_KEY" },
            ],
            transform,
        );
    };

    public func nearbySearch(lat : Float, lon : Float) : async Text {
        let url = "https:
        await OutCall.httpGetRequest(
            url,
            [
                { name = "X-RapidAPI-Host"; value = "maps-places.p.rapidapi.com" },
                { name = "X-RapidAPI-Key"; value = "YOUR_RAPIDAPI_KEY" },
            ],
            transform,
        );
    };

    public func autocomplete(input : Text) : async Text {
        let url = "https:
        await OutCall.httpGetRequest(
            url,
            [
                { name = "X-RapidAPI-Host"; value = "maps-places.p.rapidapi.com" },
                { name = "X-RapidAPI-Key"; value = "YOUR_RAPIDAPI_KEY" },
            ],
            transform,
        );
    };

    public func queryAutocomplete(input : Text) : async Text {
        let url = "https:
        await OutCall.httpGetRequest(
            url,
            [
                { name = "X-RapidAPI-Host"; value = "maps-places.p.rapidapi.com" },
                { name = "X-RapidAPI-Key"; value = "YOUR_RAPIDAPI_KEY" },
            ],
            transform,
        );
    };

    public func getPhoto(photoReference : Text) : async Text {
        let url = "https:
        await OutCall.httpGetRequest(
            url,
            [
                { name = "X-RapidAPI-Host"; value = "maps-places.p.rapidapi.com" },
                { name = "X-RapidAPI-Key"; value = "YOUR_RAPIDAPI_KEY" },
            ],
            transform,
        );
    };

type __CAFFEINE_STORAGE_RefillInformation = {
    proposed_top_up_amount: ?Nat;
};

type __CAFFEINE_STORAGE_RefillResult = {
    success: ?Bool;
    topped_up_amount: ?Nat;
};

    public shared (msg) func __CAFFEINE_STORAGE_refillCashier(refill_information: ?__CAFFEINE_STORAGE_RefillInformation) : async __CAFFEINE_STORAGE_RefillResult {
    let cashier = Principal.fromText("72ch2-fiaaa-aaaar-qbsvq-cai");
    
    assert (cashier == msg.caller);
    
    let current_balance = Cycles.balance();
    let reserved_cycles : Nat = 400_000_000_000;
    
    let current_free_cycles_count : Nat = Nat.sub(current_balance, reserved_cycles);
    
    let cycles_to_send : Nat = switch (refill_information) {
        case null { current_free_cycles_count };
        case (?info) {
            switch (info.proposed_top_up_amount) {
                case null { current_free_cycles_count };
                case (?proposed) { Nat.min(proposed, current_free_cycles_count) };
            }
        };
    };

    let target_canister = actor(Principal.toText(cashier)) : actor {
        account_top_up_v1 : ({ account : Principal }) -> async ();
    };
    
    let current_principal = Principal.fromActor(Main);
    
    await (with cycles = cycles_to_send) target_canister.account_top_up_v1({ account = current_principal });
    
    return {
        success = ?true;
        topped_up_amount = ?cycles_to_send;
    };
};
    public shared (msg) func __CAFFEINE_STORAGE_blobsToRemove() : async [Text] {
    await Registry.requireAuthorized(registry, msg.caller, "72ch2-fiaaa-aaaar-qbsvq-cai");
    
    Registry.getBlobsToRemove(registry);
};
    public shared (msg) func __CAFFEINE_STORAGE_blobsRemoved(hashes : [Text]) : async Nat {
    await Registry.requireAuthorized(registry, msg.caller, "72ch2-fiaaa-aaaar-qbsvq-cai");
    
    Registry.clearBlobsRemoved(registry, hashes);
};
    public shared (msg) func __CAFFEINE_STORAGE_updateGatewayPrincipals() : async () {
    await Registry.requireAuthorized(registry, msg.caller, "72ch2-fiaaa-aaaar-qbsvq-cai");
    await Registry.updateGatewayPrincipals(registry, "72ch2-fiaaa-aaaar-qbsvq-cai");
};
};

