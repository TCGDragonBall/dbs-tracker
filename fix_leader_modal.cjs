const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const oldModalGrid = /<div className="flex-1 overflow-y-auto grid grid-cols-4 sm:grid-cols-6 gap-3 pb-24">([\s\S]*?)<\/motion\.div>/;

const newModalGrid = `<div className="flex-1 overflow-y-auto grid grid-cols-3 md:grid-cols-5 gap-3 pb-24 px-1">
              {availableLeaders.map(c => (
                <button 
                  key={c.id}
                  onClick={() => {
                    if (leaderModal === 'my') setFormData({...formData, leaderId: c.id});
                    else setFormData({...formData, opponentLeader: c.id});
                    setLeaderModal(null);
                  }}
                  className="relative rounded-lg overflow-hidden border-2 border-transparent hover:border-orange-500 transition-all transform hover:scale-105 active:scale-95 shadow-md bg-black/40 aspect-[3/4]"
                >
                  <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </motion.div>`;

content = content.replace(oldModalGrid, newModalGrid);
fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched leader modal");
