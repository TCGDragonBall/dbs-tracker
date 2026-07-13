import { execSync } from 'child_process';
execSync('git checkout src/data');
console.log('Restored');
