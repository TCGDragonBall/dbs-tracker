const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target1 = `  result: 'win' | 'loss' | 'draw';
  notes?: string;
  gameType: 'masters' | 'fusion';`;

const replacement1 = `  result: 'win' | 'loss' | 'draw';
  notes?: string;
  myDecklist?: string;
  oppDecklist?: string;
  gameType: 'masters' | 'fusion';`;

content = content.replace(target1, replacement1);

const target2 = `  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    leaderId: '',
    opponentLeader: '',
    tournamentType: 'local',
    result: 'win' as 'win'|'loss'|'draw',
    notes: ''
  });`;

const replacement2 = `  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    leaderId: '',
    opponentLeader: '',
    tournamentType: 'local',
    result: 'win' as 'win'|'loss'|'draw',
    notes: '',
    myDecklist: '',
    oppDecklist: ''
  });`;

content = content.replace(target2, replacement2);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched MatchRecord and formData");
