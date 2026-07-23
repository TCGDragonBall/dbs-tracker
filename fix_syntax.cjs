const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const replacement = `      // Base Set Achievement (Visible)
      const baseAchId = \`\${set.id.toLowerCase()}_complete_base\`;
      if (!seenIds.has(baseAchId)) {
        const cardTagsCheckBase = (c: Card, targetSetId: string) => {
          const tags = getCardTags(c);
          if (targetSetId === 'COL02') return tags.includes('giant') || (PACK_ARRAYS['COL02'] && PACK_ARRAYS['COL02'].includes(c.id));
          if (targetSetId === 'COL08') return tags.includes('serial');
          if (targetSetId === 'COL05') return tags.includes('event');
          if (targetSetId === 'COL06') return tags.includes('tournament');
          if (targetSetId === 'COL07') return tags.includes('judge');
          if (PACK_ARRAYS[targetSetId]) return PACK_ARRAYS[targetSetId].includes(c.id);
          if (c.expansion === targetSetId) return true;
          if (targetSetId.startsWith('FB') && targetSetId !== 'FB10' && PACK_ARRAYS[\`FP_RELEASE_\${targetSetId}\`]?.includes(c.id)) return true;
          if (targetSetId === 'SB01' && PACK_ARRAYS['RE_SB01_FOLDER']?.includes(c.id)) return true;
          return false;
        };
        const isVirtual = isVirtualSet(set.id);
        const sCardsBase = cards.filter(c => cardTagsCheckBase(c, set.id) && (isVirtual || !c.id.match(/_PR\\d*$/) || c.rarity === 'SPR' || c.rarity === 'GDR'));

        list.push({
          id: baseAchId,
          category: group.category,
          subCategory: set.label,
          icon: 'Trophy',
          title: { es: \`\${set.id}: Set Base 100%\`, en: \`\${set.id} Base Set 100%\` },
          description: { es: \`Completado el set base de \${set.label} (incluyendo SPR y GDR, sin variantes promo).\`, en: \`Completed \${set.label} base set (including SPR and GDR, excluding promo variants).\` },
          type: 'unique',
          check: (cards, inventory, inventoryMap) => {
            const owned = sCardsBase.filter(l => (inventoryMap?.get(l.id) || 0) > 0);
            return { earned: owned.length === sCardsBase.length && sCardsBase.length > 0, progress: sCardsBase.length > 0 ? (owned.length / sCardsBase.length) * 100 : 0 };
          }
        });
        seenIds.add(baseAchId);
      }

      // Master Set Achievement (Hidden)
      const masterAchId = \`\${set.id.toLowerCase()}_complete_master\`;
      if (!seenIds.has(masterAchId)) {
        const cardTagsCheckMaster = (c: Card, targetSetId: string) => {
          const tags = getCardTags(c);
          if (targetSetId === 'COL02') return tags.includes('giant') || (PACK_ARRAYS['COL02'] && PACK_ARRAYS['COL02'].includes(c.id));
          if (targetSetId === 'COL08') return tags.includes('serial');
          if (targetSetId === 'COL05') return tags.includes('event');
          if (targetSetId === 'COL06') return tags.includes('tournament');
          if (targetSetId === 'COL07') return tags.includes('judge');
          if (PACK_ARRAYS[targetSetId]) return PACK_ARRAYS[targetSetId].includes(c.id);
          if (c.expansion === targetSetId) return true;
          if (targetSetId.startsWith('FB') && targetSetId !== 'FB10' && PACK_ARRAYS[\`FP_RELEASE_\${targetSetId}\`]?.includes(c.id)) return true;
          if (targetSetId === 'SB01' && PACK_ARRAYS['RE_SB01_FOLDER']?.includes(c.id)) return true;
          return false;
        };
        const sCardsMaster = cards.filter(c => cardTagsCheckMaster(c, set.id));

        list.push({
          id: masterAchId,
          category: group.category,
          subCategory: set.label,
          icon: 'Crown',
          title: { es: \`\${set.id}: Maestro de Set\`, en: \`\${set.id} Set Master\` },
          description: { es: \`Completado al 100% el set \${set.label} incluyendo TODAS las variantes alternativas.\`, en: \`100% completed \${set.label} set including ALL alternative variants.\` },
          type: 'unique',
          hidden: true,
          check: (cards, inventory, inventoryMap) => {
            const owned = sCardsMaster.filter(l => (inventoryMap?.get(l.id) || 0) > 0);
            return { earned: owned.length === sCardsMaster.length && sCardsMaster.length > 0, progress: sCardsMaster.length > 0 ? (owned.length / sCardsMaster.length) * 100 : 0 };
          }
        });
        seenIds.add(masterAchId);
      }`;

const start = content.indexOf('      // Base Set Achievement (Visible)');
const end = content.indexOf('    });\n  });', start);
if (start !== -1 && end !== -1) {
  content = content.substring(0, start) + replacement + content.substring(end);
  fs.writeFileSync('src/TrackerApp.tsx', content);
} else {
  console.log("Could not find bounds");
}
