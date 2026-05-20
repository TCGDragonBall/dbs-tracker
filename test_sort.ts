import { expansionsData } from './src/data/expansions.ts';
const lines = expansionsData.split('\n');
console.log(lines.slice(-20).join('\n'));
