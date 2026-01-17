import fs from 'fs';
import path from 'path';

/**
 * Generic Persistence Interface
 * Allows swapping the storage backend (File, SQLite, Browser LocalStorage) without changing core logic.
 */
export interface IStore<T> {
  load(): Promise<T | null>;
  save(data: T): Promise<void>;
  get(): T | null; // Synchronous access to cached state
}

/**
 * JSON File-based Store Implementation
 * Simple, human-readable persistence for local agents.
 */
export class JsonFileStore<T> implements IStore<T> {
  private cache: T | null = null;
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.ensureDirectory();
  }

  private ensureDirectory() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async load(): Promise<T | null> {
    if (!fs.existsSync(this.filePath)) {
      return null;
    }

    try {
      const data = await fs.promises.readFile(this.filePath, 'utf-8');
      this.cache = JSON.parse(data) as T;
      return this.cache;
    } catch (error) {
      console.error(`[JsonFileStore] Failed to load ${this.filePath}:`, error);
      return null;
    }
  }

  async save(data: T): Promise<void> {
    try {
      await fs.promises.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
      this.cache = data;
    } catch (error) {
      console.error(`[JsonFileStore] Failed to save to ${this.filePath}:`, error);
      throw error;
    }
  }

  get(): T | null {
    return this.cache;
  }
}

/**
 * Specialized Profile Store
 */
export class ProfileStore extends JsonFileStore<import('../core/profile').CommerceProfile> {
  constructor(basePath?: string) {
    super(basePath || path.resolve(process.cwd(), 'data', 'profile.json'));
  }
}

/**
 * Specialized Policy Store
 */
export class PolicyStore extends JsonFileStore<import('../core/profile').CommercePolicy> {
  constructor(basePath?: string) {
    super(basePath || path.resolve(process.cwd(), 'data', 'policy.json'));
  }
}
