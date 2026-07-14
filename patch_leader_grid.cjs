const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target = `<div className="flex-1 overflow-y-auto grid grid-cols-3 md:grid-cols-5 gap-3 pb-24 px-1">
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
            </div>`;

const replacement = `<div className="flex-1 overflow-y-auto grid grid-cols-3 md:grid-cols-5 gap-3 pb-24 px-1">
              {availableLeaders.map(c => (
                <CardItem 
                  key={c.id}
                  card={c}
                  quantity={1}
                  collectionGoal="collector"
                  onClick={() => {
                    if (leaderModal === 'my') setFormData({...formData, leaderId: c.id});
                    else setFormData({...formData, opponentLeader: c.id});
                    setLeaderModal(null);
                  }}
                />
              ))}
            </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched leader grid");
