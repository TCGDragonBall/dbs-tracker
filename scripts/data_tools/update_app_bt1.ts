import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the literal '\n' sequences we injected wrongly
content = content.replace(/\{\\n/g, '{\n');
content = content.replace(/',\\n/g, "',\n");
content = content.replace(/\},\\n/g, "},\n");

fs.writeFileSync(filePath, content);
console.log('App.tsx line end fixed');
