import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:base/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Char "mo:base/Char";
import Float "mo:base/Float";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import Registry "blob-storage/registry";
import ActivityLog "activity-log/activity-log";



actor {
    // ── Existing Types ──────────────────────────────────────────────────────
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

    public type Trip = {
        id : Text;
        name : Text;
        description : Text;
        placeIds : [Text];
        authorUsername : Text;
        authorName : Text;
        timestamp : Time.Time;
    };

    // ── Auth Types ──────────────────────────────────────────────────────────
    public type UserRecord = {
        username : Text;
        passwordHash : Text;
        email : Text;
        displayName : Text;
        isEmailVerified : Bool;
        isAdmin : Bool;
        createdAt : Time.Time;
    };

    public type SessionRecord = {
        username : Text;
        expiresAt : Time.Time;
    };

    public type PasswordResetRecord = {
        username : Text;
        expiresAt : Time.Time;
    };

    // ── Existing State ──────────────────────────────────────────────────────
    let accessControlState = AccessControl.initState();
    let places = Map.empty<Text, Place>();
    let notes = Map.empty<Text, Note>();
    let userProfiles = Map.empty<Principal, UserProfile>();
    let trips = Map.empty<Text, Trip>();
    // activityLogState keeps its original type (user : Principal) so it remains
    // stable-compatible across upgrades. New username-based entries go to activityLog.
    let activityLogState = ActivityLog.new();
    let registry = Registry.new();

    // Username-based activity log — stable array independent of activityLogState.
    stable var activityLog : [{ username : Text; action : Text; timestamp : Time.Time }] = [];

    func appendActivity(username : Text, action : Text) {
        let entry = { username; action; timestamp = Time.now() };
        let prev = activityLog;
        activityLog := Array.tabulate<{ username : Text; action : Text; timestamp : Time.Time }>(
            prev.size() + 1,
            func(i) { if (i < prev.size()) prev[i] else entry },
        );
    };

    var landingPageVideoPath : ?Text = null;
    var landingPagePosterPath : ?Text = null;

    // ── Auth State ──────────────────────────────────────────────────────────
    // keyed by lowercase username
    let authUsers = Map.empty<Text, UserRecord>();
    // keyed by session token
    let authSessions = Map.empty<Text, SessionRecord>();
    // email verification: token → lowercase username
    let emailVerifications = Map.empty<Text, Text>();
    // password reset: token → PasswordResetRecord
    let passwordResets = Map.empty<Text, PasswordResetRecord>();
    // tracks whether the founder has registered
    var founderRegistered : Bool = false;
    // nonce for token uniqueness
    var tokenNonce : Nat = 0;
    // when false, users can sign in immediately after registration (no email needed)
    var emailVerificationRequired : Bool = false;

    // ── Auth Helpers ────────────────────────────────────────────────────────

    // Simple polynomial hash over character codes.
    // Not cryptographic but sufficient for canister state (encrypted at rest on IC).
    func hashPassword(password : Text) : Text {
        var h : Nat = 5381;
        for (c in password.chars()) {
            let code = Nat.fromNat32(Char.toNat32(c));
            h := (h * 33 + code) % 4294967296;
        };
        // Second pass with static salt
        for (c in "mapmates_salt_2024".chars()) {
            let code = Nat.fromNat32(Char.toNat32(c));
            h := (h * 31 + code) % 4294967296;
        };
        h.toText();
    };

    // Generate a pseudo-unique token from current time + nonce + seed
    func generateToken(seed : Text) : Text {
        tokenNonce += 1;
        let t = Int.abs(Time.now());
        var h1 : Nat = t % 4294967296;
        var h2 : Nat = (tokenNonce * 2654435761) % 4294967296;
        for (c in seed.chars()) {
            let code = Nat.fromNat32(Char.toNat32(c));
            h1 := (h1 * 1664525 + code) % 4294967296;
            h2 := (h2 * 22695477 + code) % 4294967296;
        };
        h1.toText() # "_" # h2.toText() # "_" # tokenNonce.toText();
    };

    // 30 days in nanoseconds
    let sessionDuration : Int = 30 * 24 * 60 * 60 * 1_000_000_000;
    // 24 hours in nanoseconds
    let resetDuration : Int = 24 * 60 * 60 * 1_000_000_000;

    func isSessionValid(session : SessionRecord) : Bool {
        Time.now() < session.expiresAt;
    };

    func isResetValid(record : PasswordResetRecord) : Bool {
        Time.now() < record.expiresAt;
    };

    // Send email via Caffeine's managed email infrastructure → Amazon SES.
    // The HTTP outcall is coordinated across IC replica nodes.
    // Project identity is established by the canister principal (implicit in the subnet call).
    func sendEmail(toEmail : Text, subject : Text, htmlBody : Text) : async () {
        let url = "https://api.caffeine.ai/v1/email/send";
        let escapedTo = toEmail;
        let escapedSubject = subject;
        let escapedBody = htmlBody;
        let jsonBody = "{"
            # "\"to\":\"" # escapedTo # "\","
            # "\"subject\":\"" # escapedSubject # "\","
            # "\"html\":\"" # escapedBody # "\","
            # "\"project_id\":\"" # "my-app" # "\""
            # "}";
        ignore await OutCall.httpPostRequest(
            url,
            [
                { name = "Content-Type"; value = "application/json" },
                { name = "X-Caffeine-Project"; value = "my-app" },
            ],
            jsonBody,
            transform,
        );
    };

    // Build the app's base URL for email links
    func appBaseUrl() : Text {
        "https://my-app.caffeine.xyz";
    };

    // ── Auth Public Methods ─────────────────────────────────────────────────

    public shared func register(
        username : Text,
        password : Text,
        email : Text,
        displayName : Text,
    ) : async { #ok : Text; #err : Text } {
        if (password.size() < 8) {
            return #err("Password must be at least 8 characters");
        };
        if (username.size() == 0 or email.size() == 0 or displayName.size() == 0) {
            return #err("Username, email, and display name are required");
        };

        let lowerUsername = username.toLower();

        if (authUsers.containsKey(lowerUsername)) {
            return #err("Username already taken");
        };

        let emailTaken = authUsers.entries().any(func((_, u)) {
            u.email.toLower() == email.toLower()
        });
        if (emailTaken) {
            return #err("Email already registered");
        };

        let isAdmin = not founderRegistered;
        if (isAdmin) {
            founderRegistered := true;
        };

        let passwordHash = hashPassword(password);
        let verifiedAtRegistration = not emailVerificationRequired;
        let verificationToken = generateToken(lowerUsername # email);

        let newUser : UserRecord = {
            username = lowerUsername;
            passwordHash;
            email;
            displayName;
            isEmailVerified = verifiedAtRegistration;
            isAdmin;
            createdAt = Time.now();
        };

        authUsers.add(lowerUsername, newUser);

        appendActivity(lowerUsername, "Signed up");

        if (emailVerificationRequired) {
            emailVerifications.add(verificationToken, lowerUsername);
            let verifyLink = appBaseUrl() # "/verify?token=" # verificationToken;
            ignore sendEmail(
                email,
                "Verify your MapMates account",
                "Hi " # displayName # "!<br><br>"
                # "Click the link below to verify your MapMates account:<br><br>"
                # "<a href=\\\"" # verifyLink # "\\\">Verify my account</a><br><br>"
                # "Or paste this link in your browser:<br>" # verifyLink # "<br><br>"
                # "This link does not expire.<br><br>"
                # "— The MapMates team",
            );
            #ok("VERIFY:" # verificationToken);
        } else {
            ignore sendEmail(
                email,
                "Welcome to MapMates!",
                "Hi " # displayName # "!<br><br>"
                # "Your MapMates account is ready. "
                # "<a href=\\\"" # appBaseUrl() # "\\\">Sign in now</a>.<br><br>"
                # "— The MapMates team",
            );
            #ok("Registration successful. You can now sign in.");
        };
    };

    public shared func loginUser(
        username : Text,
        password : Text,
    ) : async { #ok : { sessionToken : Text; displayName : Text; isAdmin : Bool }; #err : Text } {
        let lowerUsername = username.toLower();

        switch (authUsers.get(lowerUsername)) {
            case null { #err("Invalid username or password") };
            case (?user) {
                if (user.passwordHash != hashPassword(password)) {
                    return #err("Invalid username or password");
                };
                if (not user.isEmailVerified) {
                    return #err("Please verify your email before logging in");
                };
                let sessionToken = generateToken(lowerUsername # "session");
                let session : SessionRecord = {
                    username = lowerUsername;
                    expiresAt = Time.now() + sessionDuration;
                };
                authSessions.add(sessionToken, session);
                #ok({
                    sessionToken;
                    displayName = user.displayName;
                    isAdmin = user.isAdmin;
                });
            };
        };
    };

    public shared func verifyEmail(token : Text) : async { #ok : Text; #err : Text } {
        switch (emailVerifications.get(token)) {
            case null { #err("Invalid or expired verification token") };
            case (?lowerUsername) {
                switch (authUsers.get(lowerUsername)) {
                    case null { #err("User not found") };
                    case (?user) {
                        let updatedUser : UserRecord = { user with isEmailVerified = true };
                        authUsers.add(lowerUsername, updatedUser);
                        emailVerifications.remove(token);
                        #ok("Email verified successfully. You can now log in.");
                    };
                };
            };
        };
    };

    public shared func forgotPassword(email : Text) : async { #ok : Text; #err : Text } {
        let lowerEmail = email.toLower();
        var found : ?UserRecord = null;
        authUsers.entries().forEach(func((_, u)) {
            if (u.email.toLower() == lowerEmail) {
                found := ?u;
            };
        });
        switch (found) {
            case null {
                #ok("If that email is registered, you will receive a reset link shortly.");
            };
            case (?user) {
                let resetToken = generateToken(user.username # "reset" # lowerEmail);
                let record : PasswordResetRecord = {
                    username = user.username;
                    expiresAt = Time.now() + resetDuration;
                };
                passwordResets.add(resetToken, record);
                await sendEmail(
                    email,
                    "Reset your MapMates password",
                    "Your password reset code is: " # resetToken # ". This code expires in 24 hours.",
                );
                #ok("If that email is registered, you will receive a reset link shortly.");
            };
        };
    };

    public shared func resetPassword(
        token : Text,
        newPassword : Text,
    ) : async { #ok : Text; #err : Text } {
        if (newPassword.size() < 8) {
            return #err("Password must be at least 8 characters");
        };
        switch (passwordResets.get(token)) {
            case null { #err("Invalid or expired reset token") };
            case (?record) {
                if (not isResetValid(record)) {
                    passwordResets.remove(token);
                    return #err("Reset token has expired");
                };
                switch (authUsers.get(record.username)) {
                    case null { #err("User not found") };
                    case (?user) {
                        let updatedUser : UserRecord = { user with passwordHash = hashPassword(newPassword) };
                        authUsers.add(record.username, updatedUser);
                        passwordResets.remove(token);
                        #ok("Password reset successfully. You can now log in.");
                    };
                };
            };
        };
    };

    public query func validateSession(
        sessionToken : Text
    ) : async { #ok : { username : Text; displayName : Text; isAdmin : Bool }; #err : Text } {
        switch (authSessions.get(sessionToken)) {
            case null { #err("Invalid session") };
            case (?session) {
                if (not isSessionValid(session)) {
                    return #err("Session expired");
                };
                switch (authUsers.get(session.username)) {
                    case null { #err("User not found") };
                    case (?user) {
                        #ok({
                            username = user.username;
                            displayName = user.displayName;
                            isAdmin = user.isAdmin;
                        });
                    };
                };
            };
        };
    };

    // Resend verification email (or return token in response as fallback)
    public shared func resendVerification(username : Text) : async { #ok : Text; #err : Text } {
        let lowerUsername = username.toLower();
        switch (authUsers.get(lowerUsername)) {
            case null { #err("User not found") };
            case (?user) {
                if (user.isEmailVerified) {
                    return #err("Email already verified");
                };
                let token = generateToken(lowerUsername # user.email # "resend");
                emailVerifications.add(token, lowerUsername);
                let verifyLink = appBaseUrl() # "/verify?token=" # token;
                ignore sendEmail(
                    user.email,
                    "Your MapMates verification link",
                    "Hi " # user.displayName # "!<br><br>"
                    # "Here is your new verification link:<br><br>"
                    # "<a href=\\\"" # verifyLink # "\\\">Verify my account</a><br><br>"
                    # "Or paste this link in your browser:<br>" # verifyLink # "<br><br>"
                    # "— The MapMates team",
                );
                #ok("VERIFY:" # token);
            };
        };
    };

    // Admin: toggle whether email verification is required for new sign-ups
    public shared func setEmailVerificationRequired(required : Bool) : async { #ok : Text; #err : Text } {
        // Only the first admin (founder) can change this setting
        if (not founderRegistered) {
            return #err("No admin registered yet");
        };
        emailVerificationRequired := required;
        #ok(if (required) "Email verification is now required" else "Email verification is now optional");
    };

    public query func getEmailVerificationRequired() : async Bool {
        emailVerificationRequired;
    };

    // Admin: manually verify a user's email
    public shared func adminVerifyUser(username : Text) : async { #ok : Text; #err : Text } {
        let lowerUsername = username.toLower();
        switch (authUsers.get(lowerUsername)) {
            case null { #err("User not found") };
            case (?user) {
                let updatedUser : UserRecord = { user with isEmailVerified = true };
                authUsers.add(lowerUsername, updatedUser);
                // Remove any pending verification tokens for this user
                let tokensToRemove = emailVerifications.entries()
                    .filter(func((_, u)) { u == lowerUsername })
                    .map(func((t, _)) { t })
                    .toArray();
                for (t in tokensToRemove.values()) {
                    emailVerifications.remove(t);
                };
                #ok("User " # username # " verified successfully");
            };
        };
    };

    // Admin: list all users with their verification status
    public shared func listUsers(
        sessionToken : Text,
    ) : async { #ok : [{ username : Text; displayName : Text; email : Text; isEmailVerified : Bool; isAdmin : Bool }]; #err : Text } {
        switch (authSessions.get(sessionToken)) {
            case null { #err("Invalid session") };
            case (?session) {
                if (not isSessionValid(session)) {
                    return #err("Session expired");
                };
                switch (authUsers.get(session.username)) {
                    case null { #err("User not found") };
                    case (?user) {
                        if (not user.isAdmin) {
                            return #err("Unauthorized: admin only");
                        };
                        let result = authUsers.values().map(func(u) {
                            { username = u.username; displayName = u.displayName; email = u.email; isEmailVerified = u.isEmailVerified; isAdmin = u.isAdmin }
                        }).toArray();
                        #ok(result);
                    };
                };
            };
        };
    };

    public shared func logoutUser(sessionToken : Text) : async { #ok : Text; #err : Text } {
        switch (authSessions.get(sessionToken)) {
            case null { #err("Invalid session") };
            case (?_) {
                authSessions.remove(sessionToken);
                #ok("Logged out successfully");
            };
        };
    };

    // ── Trip Management ─────────────────────────────────────────────────────
    public shared func addTrip(
        sessionToken : Text,
        name : Text,
        description : Text,
        placeIds : [Text],
    ) : async { #ok : Trip; #err : Text } {
        switch (authSessions.get(sessionToken)) {
            case null { #err("Invalid session") };
            case (?session) {
                if (not isSessionValid(session)) {
                    return #err("Session expired");
                };
                switch (authUsers.get(session.username)) {
                    case null { #err("User not found") };
                    case (?user) {
                        let tripId = generateToken("trip_" # session.username);
                        let trip : Trip = {
                            id = tripId;
                            name;
                            description;
                            placeIds;
                            authorUsername = session.username;
                            authorName = user.displayName;
                            timestamp = Time.now();
                        };
                        trips.add(tripId, trip);
                        appendActivity(session.username, "Created trip: " # name);
                        #ok(trip);
                    };
                };
            };
        };
    };

    public query func getTrips() : async [Trip] {
        trips.values().toArray();
    };

    public query func getUserTrips(username : Text) : async [Trip] {
        let lowerUsername = username.toLower();
        trips.values().filter(func(t) { t.authorUsername == lowerUsername }).toArray();
    };

    public shared func updateTrip(
        sessionToken : Text,
        tripId : Text,
        name : Text,
        description : Text,
        placeIds : [Text],
    ) : async { #ok : Trip; #err : Text } {
        switch (authSessions.get(sessionToken)) {
            case null { #err("Invalid session") };
            case (?session) {
                if (not isSessionValid(session)) {
                    return #err("Session expired");
                };
                switch (trips.get(tripId)) {
                    case null { #err("Trip not found") };
                    case (?trip) {
                        switch (authUsers.get(session.username)) {
                            case null { #err("User not found") };
                            case (?user) {
                                if (trip.authorUsername != session.username and not user.isAdmin) {
                                    return #err("Unauthorized");
                                };
                                let updated : Trip = { trip with name; description; placeIds };
                                trips.add(tripId, updated);
                                #ok(updated);
                            };
                        };
                    };
                };
            };
        };
    };

    public shared func deleteTrip(
        sessionToken : Text,
        tripId : Text,
    ) : async { #ok : Text; #err : Text } {
        switch (authSessions.get(sessionToken)) {
            case null { #err("Invalid session") };
            case (?session) {
                if (not isSessionValid(session)) {
                    return #err("Session expired");
                };
                switch (trips.get(tripId)) {
                    case null { #err("Trip not found") };
                    case (?trip) {
                        switch (authUsers.get(session.username)) {
                            case null { #err("User not found") };
                            case (?user) {
                                if (trip.authorUsername != session.username and not user.isAdmin) {
                                    return #err("Unauthorized");
                                };
                                trips.remove(tripId);
                                appendActivity(session.username, "Deleted trip: " # trip.name);
                                #ok("Trip deleted");
                            };
                        };
                    };
                };
            };
        };
    };

    public shared func deleteAllTrips(
        sessionToken : Text,
    ) : async { #ok : Text; #err : Text } {
        switch (authSessions.get(sessionToken)) {
            case null { #err("Invalid session") };
            case (?session) {
                if (not isSessionValid(session)) {
                    return #err("Session expired");
                };
                switch (authUsers.get(session.username)) {
                    case null { #err("User not found") };
                    case (?user) {
                        if (not user.isAdmin) {
                            return #err("Only admins can delete all trips");
                        };
                        trips.clear();
                        #ok("All trips deleted");
                    };
                };
            };
        };
    };

    // Log a user action from the frontend (session-token based)
    public shared func logUserActivity(
        sessionToken : Text,
        action : Text,
    ) : async { #ok : Text; #err : Text } {
        switch (authSessions.get(sessionToken)) {
            case null { #err("Invalid session") };
            case (?session) {
                if (not isSessionValid(session)) {
                    return #err("Session expired");
                };
                appendActivity(session.username, action);
                #ok("Logged");
            };
        };
    };

    // ── Existing Access Control ─────────────────────────────────────────────
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

    // ── Place Management ────────────────────────────────────────────────────
    public shared ({ caller }) func addPlace(place : Place) : async () {
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
            Runtime.trap("Unauthorized: Only users can add places");
        };
        places.add(place.id, place);
    };

    public query func getPlace(id : Text) : async ?Place {
        places.get(id);
    };

    public query func getAllPlaces() : async [Place] {
        places.values().toArray();
    };

    public shared ({ caller }) func updatePlace(place : Place) : async () {
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
            Runtime.trap("Unauthorized: Only users can update places");
        };
        places.add(place.id, place);
    };

    public shared ({ caller }) func deletePlace(id : Text) : async () {
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
            Runtime.trap("Unauthorized: Only users can delete places");
        };
        places.remove(id);
    };

    public shared ({ caller }) func deleteAllPlaces() : async () {
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
            Runtime.trap("Unauthorized: Only admins can delete all places");
        };
        places.clear();
    };

    // ── Notes Management ────────────────────────────────────────────────────
    public shared ({ caller }) func addNote(note : Note) : async () {
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
            Runtime.trap("Unauthorized: Only users can add notes");
        };
        notes.add(note.placeId, note);
    };

    public query func getNotesForPlace(placeId : Text) : async [Note] {
        let allNotes = notes.values().toArray();
        allNotes.filter<Note>(func(n) { n.placeId == placeId });
    };

    // ── User Management ─────────────────────────────────────────────────────
    public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
        userProfiles.get(caller);
    };

    public query func getUserProfile(user : Principal) : async ?UserProfile {
        userProfiles.get(user);
    };

    public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
        userProfiles.add(caller, profile);
    };

    // ── File Registry ────────────────────────────────────────────────────────
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

    // ── Activity Log ─────────────────────────────────────────────────────────
    public query func getActivityLog() : async [{ username : Text; action : Text; timestamp : Time.Time }] {
        activityLog;
    };

    // ── Filtering and Search ─────────────────────────────────────────────────
    public query func filterPlacesByCountry(country : Text) : async [Place] {
        let allPlaces = places.values().toArray();
        allPlaces.filter<Place>(func(p) { p.country == country });
    };

    func normalizeText(t : Text) : Text {
        let chars = t.chars().toArray();
        let filtered = chars.filter(func(c) {
            not Char.isWhitespace(c) and not Char.isDigit(c)
        });
        Text.fromIter(filtered.values());
    };

    public query func searchPlaces(term : Text) : async [Place] {
        let normalizedTerm = normalizeText(term);
        let allPlaces = places.values().toArray();
        allPlaces.filter<Place>(func(p) {
            let normalizedCountry = normalizeText(p.country);
            let normalizedCity = normalizeText(p.city);
            let normalizedNotes = normalizeText(p.notes);
            normalizedCountry.contains(#text normalizedTerm) or
            normalizedCity.contains(#text normalizedTerm) or
            normalizedNotes.contains(#text normalizedTerm);
        });
    };

    // ── Random Place Picker ──────────────────────────────────────────────────
    public query func getRandomToResearchPlace() : async ?Place {
        let allPlaces = places.values().toArray();
        let toResearch = allPlaces.filter(func(p) {
            p.status.any<PlaceStatus>(func(s) { s == #toResearch });
        });
        let size = toResearch.size();
        if (size == 0) {
            return null;
        };
        let index = Int.abs(Time.now() % (size : Int));
        if (index < size) { ?toResearch[index] } else { null };
    };

    // ── Statistics ───────────────────────────────────────────────────────────
    public query func getStats() : async {
        totalPlaces : Nat;
        researchedPlaces : Nat;
        toResearchPlaces : Nat;
        visitedPlaces : Nat;
        planningPlaces : Nat;
        wantToGoPlaces : Nat;
        totalCountries : Nat;
        totalTrips : Nat;
    } {
        let allPlaces = places.values().toArray();
        let researched = allPlaces.filter(func(p) {
            p.status.any<PlaceStatus>(func(s) { s == #researched });
        });
        let toResearch = allPlaces.filter(func(p) {
            p.status.any<PlaceStatus>(func(s) { s == #toResearch });
        });
        let visited = allPlaces.filter(func(p) {
            p.status.any<PlaceStatus>(func(s) { s == #visited or s == #wouldReturn });
        });
        let planning = allPlaces.filter(func(p) {
            p.status.any<PlaceStatus>(func(s) { s == #planning });
        });
        let wantToGo = allPlaces.filter(func(p) {
            p.status.any<PlaceStatus>(func(s) { s == #wantToGo });
        });
        let uniqueCountries = Map.empty<Text, Bool>();
        for (p in allPlaces.values()) {
            uniqueCountries.add(p.country.toLower(), true);
        };
        {
            totalPlaces = allPlaces.size();
            researchedPlaces = researched.size();
            toResearchPlaces = toResearch.size();
            visitedPlaces = visited.size();
            planningPlaces = planning.size();
            wantToGoPlaces = wantToGo.size();
            totalCountries = uniqueCountries.size();
            totalTrips = trips.size();
        };
    };

    // ── Google Maps Places API via HTTP outcalls ─────────────────────────────
    public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
        OutCall.transform(input);
    };

    public func getPlaceDetails(placeId : Text) : async Text {
        let url = "https://google-map-places.p.rapidapi.com/maps/api/place/details/json?place_id=" # placeId # "&fields=all&language=en";
        await OutCall.httpGetRequest(
            url,
            [
                { name = "x-rapidapi-host"; value = "google-map-places.p.rapidapi.com" },
                { name = "x-rapidapi-key"; value = "9333cf26c8mshd9fe3ff02a53dddp194f48jsn535f92c3496c" },
            ],
            transform,
        );
    };

    public func textSearch(searchQuery : Text) : async Text {
        let url = "https://google-map-places.p.rapidapi.com/maps/api/place/textsearch/json?query=" # searchQuery # "&language=en";
        await OutCall.httpGetRequest(
            url,
            [
                { name = "x-rapidapi-host"; value = "google-map-places.p.rapidapi.com" },
                { name = "x-rapidapi-key"; value = "9333cf26c8mshd9fe3ff02a53dddp194f48jsn535f92c3496c" },
            ],
            transform,
        );
    };

    public func findPlaceFromText(input : Text) : async Text {
        let url = "https://google-map-places.p.rapidapi.com/maps/api/place/findplacefromtext/json?input=" # input # "&inputtype=textquery&fields=all&language=en";
        await OutCall.httpGetRequest(
            url,
            [
                { name = "x-rapidapi-host"; value = "google-map-places.p.rapidapi.com" },
                { name = "x-rapidapi-key"; value = "9333cf26c8mshd9fe3ff02a53dddp194f48jsn535f92c3496c" },
            ],
            transform,
        );
    };

    public func nearbySearch(lat : Float, lon : Float) : async Text {
        let url = "https://google-map-places.p.rapidapi.com/maps/api/place/nearbysearch/json?location=" # Float.toText(lat) # "," # Float.toText(lon) # "&radius=1000&language=en";
        await OutCall.httpGetRequest(
            url,
            [
                { name = "x-rapidapi-host"; value = "google-map-places.p.rapidapi.com" },
                { name = "x-rapidapi-key"; value = "9333cf26c8mshd9fe3ff02a53dddp194f48jsn535f92c3496c" },
            ],
            transform,
        );
    };

    public func autocomplete(input : Text) : async Text {
        let url = "https://google-map-places.p.rapidapi.com/maps/api/place/autocomplete/json?input=" # input # "&language=en";
        await OutCall.httpGetRequest(
            url,
            [
                { name = "x-rapidapi-host"; value = "google-map-places.p.rapidapi.com" },
                { name = "x-rapidapi-key"; value = "9333cf26c8mshd9fe3ff02a53dddp194f48jsn535f92c3496c" },
            ],
            transform,
        );
    };

    public func queryAutocomplete(input : Text) : async Text {
        let url = "https://google-map-places.p.rapidapi.com/maps/api/place/queryautocomplete/json?input=" # input # "&language=en";
        await OutCall.httpGetRequest(
            url,
            [
                { name = "x-rapidapi-host"; value = "google-map-places.p.rapidapi.com" },
                { name = "x-rapidapi-key"; value = "9333cf26c8mshd9fe3ff02a53dddp194f48jsn535f92c3496c" },
            ],
            transform,
        );
    };

    // ── Landing Page Video ───────────────────────────────────────────────────
    public shared ({ caller }) func setLandingPageVideo(videoPath : Text, posterPath : ?Text) : async () {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
            Runtime.trap("Unauthorized: Only admins can set the landing page video");
        };
        landingPageVideoPath := ?videoPath;
        landingPagePosterPath := posterPath;
    };

    public query func getLandingPageVideo() : async ?{ videoPath : Text; posterPath : ?Text } {
        switch (landingPageVideoPath) {
            case (?vp) { ?{ videoPath = vp; posterPath = landingPagePosterPath } };
            case null { null };
        };
    };
};
