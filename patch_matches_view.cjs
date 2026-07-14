const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target = `const MatchesView = ({ matches, onBack, lang, userUid, gameType, cards }: { matches: MatchRecord[], onBack: () => void, lang: 'es' | 'en', userUid: string, gameType: 'masters' | 'fusion', cards: Card[] }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');`;

const replacement = `const MatchesView = ({ matches, onBack, lang, userUid, gameType, cards }: { matches: MatchRecord[], onBack: () => void, lang: 'es' | 'en', userUid: string, gameType: 'masters' | 'fusion', cards: Card[] }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});`;

content = content.replace(target, replacement);

const targetSave = `    try {
      await addDoc(collection(db, 'matches'), {
        ownerId: userUid,
        gameType,
        date: formData.date,
        leaderId: formData.leaderId,
        leaderColor: myLeaderCard?.color || 'Red',
        opponentLeader: formData.opponentLeader,
        opponentColor: oppLeaderCard?.color || 'Red',
        tournamentType: formData.tournamentType,
        result: formData.result,
        notes: formData.notes,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);`;

const replacementSave = `    try {
      if (editingMatchId) {
        await updateDoc(doc(db, 'matches', editingMatchId), {
          date: formData.date,
          leaderId: formData.leaderId,
          leaderColor: myLeaderCard?.color || 'Red',
          opponentLeader: formData.opponentLeader,
          opponentColor: oppLeaderCard?.color || 'Red',
          tournamentType: formData.tournamentType,
          result: formData.result,
          notes: formData.notes
        });
      } else {
        await addDoc(collection(db, 'matches'), {
          ownerId: userUid,
          gameType,
          date: formData.date,
          leaderId: formData.leaderId,
          leaderColor: myLeaderCard?.color || 'Red',
          opponentLeader: formData.opponentLeader,
          opponentColor: oppLeaderCard?.color || 'Red',
          tournamentType: formData.tournamentType,
          result: formData.result,
          notes: formData.notes,
          createdAt: serverTimestamp()
        });
      }
      setIsAdding(false);
      setEditingMatchId(null);`;

content = content.replace(targetSave, replacementSave);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched states and save handler");
