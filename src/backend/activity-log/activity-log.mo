import Principal "mo:core/Principal";
import Time "mo:base/Time";
import Text "mo:core/Text";
import List "mo:core/List";

module {
    public type ActivityEntry = {
        user : Principal;
        action : Text;
        timestamp : Time.Time;
    };

    public type ActivityLogState = {
        entries : List.List<ActivityEntry>;
    };

    public func new() : ActivityLogState {
        { entries = List.empty<ActivityEntry>() };
    };

    public func logSignup(state : ActivityLogState, user : Principal) {
        let entry : ActivityEntry = {
            user = user;
            action = "User signed up";
            timestamp = Time.now();
        };
        state.entries.add(entry);
    };

    public func getLog(state : ActivityLogState) : [ActivityEntry] {
        state.entries.toArray();
    };
};
