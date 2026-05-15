import { execSync } from 'child_process';
execSync('git checkout .');
console.log('Restored git');
