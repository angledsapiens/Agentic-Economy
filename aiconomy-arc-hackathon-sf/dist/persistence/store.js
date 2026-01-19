"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyStore = exports.ProfileStore = exports.JsonFileStore = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * JSON File-based Store Implementation
 * Simple, human-readable persistence for local agents.
 */
class JsonFileStore {
    constructor(filePath) {
        this.cache = null;
        this.filePath = filePath;
        this.ensureDirectory();
    }
    ensureDirectory() {
        const dir = path_1.default.dirname(this.filePath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    }
    async load() {
        if (!fs_1.default.existsSync(this.filePath)) {
            return null;
        }
        try {
            const data = await fs_1.default.promises.readFile(this.filePath, 'utf-8');
            this.cache = JSON.parse(data);
            return this.cache;
        }
        catch (error) {
            console.error(`[JsonFileStore] Failed to load ${this.filePath}:`, error);
            return null;
        }
    }
    async save(data) {
        try {
            await fs_1.default.promises.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
            this.cache = data;
        }
        catch (error) {
            console.error(`[JsonFileStore] Failed to save to ${this.filePath}:`, error);
            throw error;
        }
    }
    get() {
        return this.cache;
    }
}
exports.JsonFileStore = JsonFileStore;
/**
 * Specialized Profile Store
 */
class ProfileStore extends JsonFileStore {
    constructor(basePath) {
        super(basePath || path_1.default.resolve(process.cwd(), 'data', 'profile.json'));
    }
}
exports.ProfileStore = ProfileStore;
/**
 * Specialized Policy Store
 */
class PolicyStore extends JsonFileStore {
    constructor(basePath) {
        super(basePath || path_1.default.resolve(process.cwd(), 'data', 'policy.json'));
    }
}
exports.PolicyStore = PolicyStore;
