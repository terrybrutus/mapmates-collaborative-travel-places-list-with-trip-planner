import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";

module {
    public type FileReference = {
        path : Text;
        hash : Text;
    };

    public type Registry = {
        references : Map.Map<Text, FileReference>;
    };

    public func new() : Registry {
        {
            references = Map.empty<Text, FileReference>();
        };
    };

    public func add(registry : Registry, path : Text, hash : Text) {
        let fileReference = { path; hash };
        registry.references.add(path, fileReference);
    };

    public func get(registry : Registry, path : Text) : FileReference {
        switch (registry.references.get(path)) {
            case null Runtime.trap("Inexistent file reference");
            case (?fileReference) fileReference;
        };
    };

    public func list(registry : Registry) : [FileReference] {
        registry.references.toArray().map<(Text, FileReference), FileReference>(func((_, ref)) { ref });
    };

    public func remove(registry : Registry, path : Text) {
        registry.references.remove(path);
    };
};
