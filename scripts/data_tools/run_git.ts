import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function findGitRepos(dir: string, depth = 0) {
  if (depth > 4) return;
  try {
    const files = fs.readdirSync(dir);
    if (files.includes('.git')) {
      console.log('Found .git in:', dir);
    }
    for (const file of files) {
      if (file === 'node_modules' || file === '.next' || file === 'dist') continue;
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          findGitRepos(fullPath, depth + 1);
        }
      } catch (e) {}
    }
  } catch (e) {}
}

console.log('Searching for .git repos...');
findGitRepos('/');
console.log('Done searching.');
