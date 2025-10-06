export declare class LiteDbService {
    private dbPath;
    constructor();
    getCollection<T>(collectionName: string): Promise<any>;
    ensureCollections(): Promise<void>;
    close(): Promise<void>;
}
