import Time "mo:base/Time";
import Text "mo:core/Text";
import List "mo:core/List";

module {
    public type ActivityEntry = {
        username : Text;
        action : Text;
        timestamp : Time.Time;
    };

    public type ActivityLogState = {
        entries : List.List<ActivityEntry>;
    };

    public func new() : ActivityLogState {
        { entries = List.empty<ActivityEntry>() };
    };

    public func logActivity(state : ActivityLogState, username : Text, action : Text) {
        let entry : ActivityEntry = {
            username;
            action;
            timestamp = Time.now();
        };
        state.entries.add(entry);
    };

    public func getLog(state : ActivityLogState) : [ActivityEntry] {
        state.entries.toArray();
    };
};
