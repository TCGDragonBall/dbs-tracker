const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const targetList = `<div className="absolute top-3 right-3 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(match)} className="p-1.5 bg-black/50 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Edit">
                                              <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(match.id)} className="p-1.5 bg-black/50 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                          <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col pr-16">`;

const replacementList = `<div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col">
                                              <span className="font-black uppercase text-sm">{resConf?.name[lang]}</span>
                                              <span className="text-[10px] opacity-70">{new Date(match.date).toLocaleDateString()} • {tType?.name[lang]}</span>
                                            </div>
                                            <div className="flex gap-2">
                                              <button onClick={() => handleEdit(match)} className="p-1.5 bg-black/50 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Edit">
                                                <Edit2 size={14} />
                                              </button>
                                              <button onClick={() => handleDelete(match.id)} className="p-1.5 bg-black/50 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                                                <Trash2 size={14} />
                                              </button>
                                            </div>
                                          </div>`;

content = content.replace(targetList, replacementList);

// Stats Latest Results view
const targetStats = `<div key={match.id} className={\`p-4 rounded-2xl border bg-black/40 \${resConf?.color}\`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">`;

const replacementStats = `<div key={match.id} className={\`p-4 rounded-2xl border bg-black/40 \${resConf?.color}\`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">`;

// Wait, the match is exactly what I need to replace.
// Let's do a precise replace for the Stats section.
