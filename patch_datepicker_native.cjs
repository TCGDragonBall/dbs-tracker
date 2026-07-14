const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target = `<div className="relative">
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-orange-500 outline-none [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                  style={{ colorScheme: "dark" }}
                />
              </div>`;

const replacement = `<input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-orange-500 outline-none"
                style={{ colorScheme: "dark" }}
              />`;

content = content.replace(target, replacement);
fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched datepicker back to native");
