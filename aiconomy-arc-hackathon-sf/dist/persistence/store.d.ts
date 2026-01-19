/**
 * Generic Persistence Interface
 * Allows swapping the storage backend (File, SQLite, Browser LocalStorage) without changing core logic.
 */
export interface IStore<T> {
    load(): Promise<T | null>;
    save(data: T): Promise<void>;
    get(): T | null;
}
/**
 * JSON File-based Store Implementation
 * Simple, human-readable persistence for local agents.
 */
export declare class JsonFileStore<T> implements IStore<T> {
    private cache;
    private filePath;
    constructor(filePath: string);
    private ensureDirectory;
    load(): Promise<T | null>;
    save(data: T): Promise<void>;
    get(): T | null;
}
/**
 * Specialized Profile Store
 */
export declare class ProfileStore extends JsonFileStore<import('../core/profile').CommerceProfile> {
    constructor(basePath?: string);
}
/**
 * Specialized Policy Store
 */
export declare class PolicyStore extends JsonFileStore<import('../core/profile').CommercePolicy> {
    constructor(basePath?: string);
}
