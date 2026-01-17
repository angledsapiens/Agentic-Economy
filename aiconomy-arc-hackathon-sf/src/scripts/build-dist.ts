import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
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
    execSync(`"${nodePath}" "${tscJsPath}"`, { stdio: 'inherit', cwd: path.resolve(__dirname, '../../') });
  } catch (e) {
    console.error('Compilation failed:', e);
    process.exit(1);
  }

  // 3. Obfuscate JS files
  console.log('Obfuscating JavaScript files...');
  const processDirectory = (dir: string) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (file.endsWith('.js')) {
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
