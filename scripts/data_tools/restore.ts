import { execSync } from 'child_process';
execSync('git -C /app checkout applet/src/TrackerApp.tsx');
console.log('Restored');
