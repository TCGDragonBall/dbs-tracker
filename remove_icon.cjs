const fs = require('fs');

let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const targetContent = `                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                      <Layers size={20} />
                    </div>
                    <div className="text-left flex-1">`;

const replacementContent = `                  <div className="flex items-center gap-3">
                    <div className="text-left flex-1">`;

if (data.includes(targetContent)) {
    data = data.replace(targetContent, replacementContent);
    fs.writeFileSync('src/TrackerApp.tsx', data);
    console.log("Removed icon successfully.");
} else {
    console.log("Target content not found.");
}
