import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";

module {
    public type ActivityEntry = {
        user : Principal;
        action : Text;
        timestamp : Time.Time;
    };

    public type ActivityLogState = {
        var entries : [ActivityEntry];
    };

    public func new() : ActivityLogState {
        { var entries = [] };
    };

    public func logSignup(state : ActivityLogState, user : Principal) {
        let entry : ActivityEntry = {
            user = user;
            action = "User signed up";
            timestamp = Time.now();
        };
        state.entries := Array.append(state.entries, [entry]);
    };

    public func getLog(state : ActivityLogState) : [ActivityEntry] {
        state.entries;
    };
};

