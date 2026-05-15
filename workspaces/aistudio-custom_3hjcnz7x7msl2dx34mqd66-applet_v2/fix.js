import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /\/\/ LEVEL 2 LIST OF SETS[\s\S]*?: currentGroups\.find\(g => g\.category === currentCollectionSubCategory\);/
const replacement = `// LEVEL 2 LIST OF SETS
                           const isColeccionismo = currentCollectionCategory === 'coleccionismo';
                           const isStoreEvents = currentCollectionCategory === 'store-events';
                           const isChampionship = currentCollectionCategory === 'championship';
                           
                           const activeGroup = isColeccionismo 
                             ? { 
                                 items: currentGroups.find(g => g.category === 'Coleccionismo')
                                   ?.items.filter(sub => {
                                     const parent = currentGroups.find(g => g.category === 'Coleccionismo')?.items.find(i => i.label === currentCollectionSubCategory);
                                     if (!parent) return false;
                                     return (sub as any).isSubItem && (
                                       (parent.id === 'COL05' && sub.id.startsWith('EP')) || 
                                       (parent.id === 'COL07' && sub.id.startsWith('JP'))
                                     );
                                   }) || []
                               }
                             : isStoreEvents
                             ? {
                                 items: currentGroups.find(g => g.category === 'Store Events')
                                   ?.items.find(i => i.label === currentCollectionSubCategory)?.subItems || []
                               }
                             : isChampionship
                             ? {
                                 items: currentGroups.find(g => g.category === 'Championship')
                                   ?.items.find(i => i.label === currentCollectionSubCategory)?.subItems || []
                               }
                             : currentGroups.find(g => g.category === currentCollectionSubCategory);`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
