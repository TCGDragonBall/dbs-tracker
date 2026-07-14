const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target = `  const leaderCounts = filteredMatches.reduce((acc, m) => {
    acc[m.leaderId] = (acc[m.leaderId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topLeaderId = Object.entries(leaderCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topLeaderCard = cards.find(c => c.id === topLeaderId);

  const oppCounts = filteredMatches.reduce((acc, m) => {
    acc[m.opponentLeader] = (acc[m.opponentLeader] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topOpponentId = Object.entries(oppCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topOpponentCard = cards.find(c => c.id === topOpponentId);`;

const replacement = `  const leaderCounts = filteredMatches.reduce((acc, m) => {
    const baseId = m.leaderId.split('_')[0];
    acc[baseId] = (acc[baseId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topLeaderId = Object.entries(leaderCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topLeaderCard = cards.find(c => c.id === topLeaderId);

  const oppCounts = filteredMatches.reduce((acc, m) => {
    const baseId = m.opponentLeader.split('_')[0];
    acc[baseId] = (acc[baseId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topOpponentId = Object.entries(oppCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topOpponentCard = cards.find(c => c.id === topOpponentId);

  // Win percentage calculations
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  let topLeaderMonthWins = 0;
  let topLeaderMonthTotal = 0;
  let topLeaderYearWins = 0;
  let topLeaderYearTotal = 0;
  
  if (topLeaderId) {
    filteredMatches.forEach(m => {
      const baseId = m.leaderId.split('_')[0];
      if (baseId === topLeaderId) {
        const mDate = new Date(m.date);
        if (mDate.getFullYear() === currentYear) {
          topLeaderYearTotal++;
          if (m.result === 'win') topLeaderYearWins++;
          if (mDate.getMonth() === currentMonth) {
            topLeaderMonthTotal++;
            if (m.result === 'win') topLeaderMonthWins++;
          }
        }
      }
    });
  }
  
  const topLeaderMonthWinPct = topLeaderMonthTotal > 0 ? Math.round((topLeaderMonthWins / topLeaderMonthTotal) * 100) : 0;
  const topLeaderYearWinPct = topLeaderYearTotal > 0 ? Math.round((topLeaderYearWins / topLeaderYearTotal) * 100) : 0;
  
  const tourneyCounts = filteredMatches.reduce((acc, m) => {
    acc[m.tournamentType] = (acc[m.tournamentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topTourneyId = Object.entries(tourneyCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topTourneyType = topTourneyId ? TOURNEY_TYPES.find(t => t.id === topTourneyId) : null;
`;

content = content.replace(target, replacement);
fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched stats calculation");
