import { execSync } from 'child_process';
import { existsSync, rmSync, mkdirSync, copyFileSync } from 'fs';
import { cp } from 'fs/promises';
import path from 'path';

async function main() {
  // Clean previous layer folder & zip
  if (existsSync('layer')) rmSync('layer', { recursive: true, force: true });
  if (existsSync('layer.zip')) rmSync('layer.zip');

  // Create folder structure
  mkdirSync('layer/nodejs', { recursive: true });

  // Copy node_modules to layer/nodejs
  await cp('node_modules', 'layer/nodejs/node_modules', { recursive: true });

  // Create zip using system zip command
  execSync('zip -r layer.zip .', { cwd: 'layer', stdio: 'inherit' });

  console.log('Created layer.zip successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
