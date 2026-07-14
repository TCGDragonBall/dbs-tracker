const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target1 = `  const handleEdit = (match: MatchRecord) => {
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
  };`;

const replacement1 = `  const handleEdit = (match: MatchRecord) => {
    setEditingMatchId(match.id);
    setFormData({
      date: match.date,
      leaderId: match.leaderId,
      opponentLeader: match.opponentLeader,
      tournamentType: match.tournamentType,
      result: match.result,
      notes: match.notes || '',
      myDecklist: match.myDecklist || '',
      oppDecklist: match.oppDecklist || ''
    });
    setIsAdding(true);
  };`;

content = content.replace(target1, replacement1);

const target2 = `        await updateDoc(doc(db, 'matches', editingMatchId), {
          date: formData.date,
          leaderId: formData.leaderId,
          leaderColor: myLeaderCard?.color || 'Red',
          opponentLeader: formData.opponentLeader,
          opponentColor: oppLeaderCard?.color || 'Red',
          tournamentType: formData.tournamentType,
          result: formData.result,
          notes: formData.notes
        });`;

const replacement2 = `        await updateDoc(doc(db, 'matches', editingMatchId), {
          date: formData.date,
          leaderId: formData.leaderId,
          leaderColor: myLeaderCard?.color || 'Red',
          opponentLeader: formData.opponentLeader,
          opponentColor: oppLeaderCard?.color || 'Red',
          tournamentType: formData.tournamentType,
          result: formData.result,
          notes: formData.notes,
          myDecklist: formData.myDecklist,
          oppDecklist: formData.oppDecklist
        });`;

content = content.replace(target2, replacement2);

const target3 = `          tournamentType: formData.tournamentType,
          result: formData.result,
          notes: formData.notes,
          createdAt: serverTimestamp()
        });`;

const replacement3 = `          tournamentType: formData.tournamentType,
          result: formData.result,
          notes: formData.notes,
          myDecklist: formData.myDecklist,
          oppDecklist: formData.oppDecklist,
          createdAt: serverTimestamp()
        });`;

content = content.replace(target3, replacement3);

const target4 = `      setFormData({
        date: new Date().toISOString().split('T')[0],
        leaderId: '',
        opponentLeader: '',
        tournamentType: 'local',
        result: 'win',
        notes: ''
      });`;

const replacement4 = `      setFormData({
        date: new Date().toISOString().split('T')[0],
        leaderId: '',
        opponentLeader: '',
        tournamentType: 'local',
        result: 'win',
        notes: '',
        myDecklist: '',
        oppDecklist: ''
      });`;

content = content.replace(target4, replacement4);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched save and edit match");
