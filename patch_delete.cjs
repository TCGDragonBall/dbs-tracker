const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target = `  const handleSave = async (e: React.FormEvent) => {`;
const replacement = `  const handleDelete = async (matchId: string) => {
    if (confirm(lang === 'es' ? '¿Estás seguro de que quieres borrar esta partida?' : 'Are you sure you want to delete this match?')) {
      try {
        await deleteDoc(doc(db, 'matches', matchId));
      } catch (error) {
        console.error("Error deleting match:", error);
      }
    }
  };
  
  const handleEdit = (match: MatchRecord) => {
    setEditingMatchId(match.id);
    setFormData({
      date: match.date,
      leaderId: match.leaderId,
      opponentLeader: match.opponentLeader,
      tournamentType: match.tournamentType,
      result: match.result,
      notes: match.notes || ''
    });
    setIsAdding(true);
  };

  const handleSave = async (e: React.FormEvent) => {`;

content = content.replace(target, replacement);

// Group matches by year and month
const targetGroup = `  const filteredMatches = matches.filter(m => m.gameType === gameType);`;
const replacementGroup = `  const filteredMatches = matches.filter(m => m.gameType === gameType);
  
  const groupedMatches = useMemo(() => {
    const groups: Record<string, Record<string, MatchRecord[]>> = {};
    filteredMatches.forEach(m => {
      const d = new Date(m.date);
      const year = d.getFullYear().toString();
      const month = d.getMonth().toString(); // 0-11
      if (!groups[year]) groups[year] = {};
      if (!groups[year][month]) groups[year][month] = [];
      groups[year][month].push(m);
    });
    return groups;
  }, [filteredMatches]);
  
  const monthNames = lang === 'es' 
    ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
`;

content = content.replace(targetGroup, replacementGroup);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched delete, edit and grouping");
