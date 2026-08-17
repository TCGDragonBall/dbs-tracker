const fs = require('fs');

const path = 'src/TrackerApp.tsx';
let content = fs.readFileSync(path, 'utf-8');

const stateBlock = `  const [bulkQuantity, setBulkQuantity] = useState(1);
  const [bulkVariantLabelEn, setBulkVariantLabelEn] = useState<string>('Normal');

  const commonVariants = useMemo(() => {
    if (selectedCardIds.size === 0) return [];
    let currentCommon: Record<'es' | 'en', string>[] | null = null;
    
    for (const cardId of selectedCardIds) {
      const variations = CARD_VARIATIONS[cardId] || [{ id: cardId, label: { es: 'Normal', en: 'Normal' }, isFoil: false }];
      
      if (currentCommon === null) {
        currentCommon = variations.map(v => v.label);
      } else {
        const variationLabels = variations.map(v => v.label.en);
        currentCommon = currentCommon.filter(c => variationLabels.includes(c.en));
      }
    }
    
    return currentCommon || [];
  }, [selectedCardIds]);

  useEffect(() => {
    if (commonVariants.length > 0 && !commonVariants.some(v => v.en === bulkVariantLabelEn)) {
      setBulkVariantLabelEn(commonVariants[0].en);
    }
  }, [commonVariants, bulkVariantLabelEn]);`;

content = content.replace('  const [bulkQuantity, setBulkQuantity] = useState(1);', stateBlock);

// update handleBulkUpdate
const originalBulkUpdate = `  const handleBulkUpdate = async (action?: 'add' | 'delete') => {
    if (selectedCardIds.size === 0 || !user || isQuotaExceeded) return;
    
    setIsSyncing(true);
    try {
      const batch = writeBatch(db);
      const now = serverTimestamp();
      const updatedCardIds = Array.from(selectedCardIds);
      
      let newInventory = [...inventory];

      // Determine if this is a deletion
      const isDeletion = action === 'delete' || (
        action === undefined &&
        collectionGoal === 'collector' && 
        updatedCardIds.every(id => {
          const item = inventory.find(i => i.cardId === id);
          return item && item.quantity >= 1;
        })
      );`;

const newBulkUpdate = `  const handleBulkUpdate = async (action?: 'add' | 'delete') => {
    if (selectedCardIds.size === 0 || !user || isQuotaExceeded) return;
    
    setIsSyncing(true);
    try {
      const batch = writeBatch(db);
      const now = serverTimestamp();
      const updatedBaseCardIds = Array.from(selectedCardIds);
      
      let newInventory = [...inventory];

      // Determine the specific variation ID for each selected base card
      const getTargetId = (baseId: string) => {
        if (!bulkVariantLabelEn) return baseId;
        const variations = CARD_VARIATIONS[baseId];
        if (variations) {
          const match = variations.find(v => v.label.en === bulkVariantLabelEn);
          if (match) return match.id;
        }
        return baseId; // Fallback
      };

      const updatedCardIds = updatedBaseCardIds.map(getTargetId);

      // Determine if this is a deletion
      const isDeletion = action === 'delete' || (
        action === undefined &&
        collectionGoal === 'collector' && 
        updatedCardIds.every(id => {
          const item = inventory.find(i => i.cardId === id);
          return item && item.quantity >= 1;
        })
      );`;

content = content.replace(originalBulkUpdate, newBulkUpdate);
fs.writeFileSync(path, content, 'utf-8');
console.log('Done replacement');
