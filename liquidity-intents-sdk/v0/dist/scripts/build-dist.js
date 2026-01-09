"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const JavaScriptObfuscator = require('javascript-obfuscator');
const DIST_DIR = path.resolve(__dirname, '../../dist');
const SRC_DIR = path.resolve(__dirname, '..');
async function build() {
    console.log('Building distribution...');
    // 1. Clean dist
    if (fs.existsSync(DIST_DIR)) {
        fs.removeSync(DIST_DIR);
    }
    fs.ensureDirSync(DIST_DIR);
    // 2. Compile TypeScript
    console.log('Compiling TypeScript...');
    const tscJsPath = path.resolve(__dirname, '../../node_modules/typescript/bin/tsc');
    const nodePath = process.execPath;
    try {
        (0, child_process_1.execSync)(`"${nodePath}" "${tscJsPath}"`, { stdio: 'inherit', cwd: path.resolve(__dirname, '../../') });
    }
    catch (e) {
        console.error('Compilation failed:', e);
        process.exit(1);
    }
    // 3. Obfuscate JS files
    console.log('Obfuscating JavaScript files...');
    const processDirectory = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                processDirectory(filePath);
            }
            else if (file.endsWith('.js')) {
                const sourceCode = fs.readFileSync(filePath, 'utf8');
                const obfuscationResult = JavaScriptObfuscator.obfuscate(sourceCode, {
                    compact: true,
                    controlFlowFlattening: true,
                    controlFlowFlatteningThreshold: 1,
                    numbersToExpressions: true,
                    simplify: true,
                    stringArrayShuffle: true,
                    splitStrings: true,
                    stringArrayThreshold: 1
                });
                fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode());
                console.log(`Obfuscated: ${filePath}`);
            }
        }
    };
    // processDirectory(DIST_DIR);
    // console.log('Build complete. Obfuscated files in dist/');
    console.log('Build complete. Files in dist/ (Obfuscation Disabled for Webpack Compatibility)');
}
build();
