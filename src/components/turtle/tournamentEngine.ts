import { TurtleMatch } from './types';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../firebase';

// Helper to shuffle array (Fisher-Yates)
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const generateSwissRound1 = async (eventId: string, playerIds: string[]) => {
  const shuffled = shuffle(playerIds);
  const matches: Omit<TurtleMatch, 'id'>[] = [];
  
  for (let i = 0; i < shuffled.length; i += 2) {
    const p1 = shuffled[i];
    const p2 = i + 1 < shuffled.length ? shuffled[i + 1] : null;
    
    matches.push({
      eventId,
      round: 1,
      player1Id: p1,
      player2Id: p2,
      player1Wins: p2 === null ? 2 : 0, // Bye is usually a 2-0 win
      player2Wins: 0,
      draws: 0,
      status: p2 === null ? 'completed' : 'pending',
      createdAt: new Date()
    });
  }
  
  return matches;
};

export const generateRoundRobinMatches = async (eventId: string, playerIds: string[]) => {
  let players = shuffle(playerIds);
  // Add a 'bye' marker if odd
  if (players.length % 2 !== 0) {
    players.push('BYE');
  }
  
  const numPlayers = players.length;
  const numRounds = numPlayers - 1;
  const halfSize = numPlayers / 2;
  
  const matches: Omit<TurtleMatch, 'id'>[] = [];
  
  let currentPlayers = [...players];
  
  for (let round = 1; round <= numRounds; round++) {
    for (let i = 0; i < halfSize; i++) {
      const p1 = currentPlayers[i];
      const p2 = currentPlayers[numPlayers - 1 - i];
      
      // Ignore if it's a bye match (some systems record byes, but let's just record it with null)
      if (p1 !== 'BYE' && p2 !== 'BYE') {
        matches.push({
          eventId,
          round,
          player1Id: p1,
          player2Id: p2,
          player1Wins: 0,
          player2Wins: 0,
          draws: 0,
          status: 'pending',
          createdAt: new Date()
        });
      } else {
        const realPlayer = p1 === 'BYE' ? p2 : p1;
        matches.push({
          eventId,
          round,
          player1Id: realPlayer,
          player2Id: null,
          player1Wins: 2,
          player2Wins: 0,
          draws: 0,
          status: 'completed',
          createdAt: new Date()
        });
      }
    }
    
    // Rotate players (fix index 0, rotate the rest clockwise)
    const fixed = currentPlayers[0];
    const last = currentPlayers.pop()!;
    currentPlayers.splice(1, 0, last);
  }
  
  return matches;
};

export const saveMatchesToFirestore = async (matches: Omit<TurtleMatch, 'id'>[]) => {
  const batch = writeBatch(db);
  const matchesCollection = collection(db, 'ts_matches');
  
  matches.forEach(match => {
    const newDocRef = doc(matchesCollection);
    batch.set(newDocRef, match);
  });
  
  await batch.commit();
};

export const generateSwissNextRound = async (eventId: string, currentMatches: TurtleMatch[], playerIds: string[], currentRound: number) => {
  // Simple next round generator based on points
  // Calculate points
  const points = new Map<string, number>();
  playerIds.forEach(id => points.set(id, 0));
  
  currentMatches.forEach(m => {
    if (m.status !== 'completed') return;
    
    if (m.player1Wins > m.player2Wins && m.player1Id) {
      points.set(m.player1Id, (points.get(m.player1Id) || 0) + 3);
    } else if (m.player1Wins === m.player2Wins && m.player1Id && m.player2Id) {
      points.set(m.player1Id, (points.get(m.player1Id) || 0) + 1);
      points.set(m.player2Id, (points.get(m.player2Id) || 0) + 1);
    } else if (m.player2Wins > m.player1Wins && m.player2Id) {
      points.set(m.player2Id, (points.get(m.player2Id) || 0) + 3);
    }
    
    // Byes give 3 points usually
    if (!m.player2Id && m.player1Id) {
       points.set(m.player1Id, (points.get(m.player1Id) || 0) + 3);
    }
  });

  // Sort players by points
  const sortedPlayers = [...playerIds].sort((a, b) => (points.get(b) || 0) - (points.get(a) || 0));

  const nextRoundMatches: Omit<TurtleMatch, 'id'>[] = [];
  
  // Greedy pairing (Not perfect Swiss, but works for basic cases)
  const paired = new Set<string>();
  
  for (let i = 0; i < sortedPlayers.length; i++) {
    const p1 = sortedPlayers[i];
    if (paired.has(p1)) continue;
    
    let p2: string | null = null;
    for (let j = i + 1; j < sortedPlayers.length; j++) {
      if (!paired.has(sortedPlayers[j])) {
        // Ideally check if they haven't played before, but simplified for now
        p2 = sortedPlayers[j];
        break;
      }
    }
    
    paired.add(p1);
    if (p2) paired.add(p2);
    
    nextRoundMatches.push({
      eventId,
      round: currentRound + 1,
      player1Id: p1,
      player2Id: p2,
      player1Wins: p2 === null ? 2 : 0,
      player2Wins: 0,
      draws: 0,
      status: p2 === null ? 'completed' : 'pending',
      createdAt: new Date()
    });
  }
  
  return nextRoundMatches;
};
