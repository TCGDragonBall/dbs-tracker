const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.cjs') || f.endsWith('.js') || f.endsWith('.ts'));
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.toLowerCase().includes('giant size') || content.includes('_GS')) {
    console.log(f);
  }
});
