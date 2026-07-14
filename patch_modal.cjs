const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const oldGrid = `<div className="flex-1 overflow-y-auto grid grid-cols-4 sm:grid-cols-6 gap-3 pb-24">
              {availableLeaders.map(c => (
                <button 
                  key={c.id}
                  onClick={() => {
                    if (leaderModal === 'my') setFormData({...formData, leaderId: c.id});
                    else setFormData({...formData, opponentLeader: c.id});
                    setLeaderModal(null);
                  }}
                  className="rounded-xl overflow-hidden border-2 border-transparent hover:border-orange-500 transition-all transform hover:scale-105 active:scale-95"
                >
                  <img src={c.imageUrl} alt={c.name} className="w-full h-auto object-contain rounded-xl" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>`;

const newGrid = `<div className="flex-1 overflow-y-auto grid grid-cols-4 sm:grid-cols-6 gap-3 pb-24">
              {availableLeaders.map(c => (
                <button 
                  key={c.id}
                  onClick={() => {
                    if (leaderModal === 'my') setFormData({...formData, leaderId: c.id});
                    else setFormData({...formData, opponentLeader: c.id});
                    setLeaderModal(null);
                  }}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-transparent hover:border-orange-500 transition-all transform hover:scale-105 active:scale-95"
                >
                  <img src={c.imageUrl} alt={c.name} className="absolute inset-0 w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>`;

if (content.includes(oldGrid)) {
  content = content.replace(oldGrid, newGrid);
  fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
  console.log("Patched");
} else {
  console.log("Not found");
}
