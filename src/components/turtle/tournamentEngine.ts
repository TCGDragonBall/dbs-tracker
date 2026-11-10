import { TurtleMatch, TurtleGroup } from './types';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../firebase';

// Helper to shuffle array (Fisher-Yates)
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Calculates the number of groups based on the player count:
 * - < 14 players: 1 group
 * - 14 to 25 players: 2 groups
 * - >= 26 players: 3 groups
 */
export const getRecommendedGroupCount = (playerCount: number): number => {
  if (playerCount >= 26) return 3;
  if (playerCount >= 14) return 2;
  return 1;
};

/**
 * Distributes players evenly across the required number of groups.
 */
export const distributePlayersIntoGroups = (
  playerIds: string[],
  groupCount?: number
): TurtleGroup[] => {
  const count = groupCount || getRecommendedGroupCount(playerIds.length);
  const shuffled = shuffle(playerIds);
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  const groups: TurtleGroup[] = Array.from({ length: count }, (_, i) => ({
    id: `group_${letters[i].toLowerCase()}`,
    name: `Grupo ${letters[i]}`,
    playerIds: []
  }));

  shuffled.forEach((pid, idx) => {
    groups[idx % count].playerIds.push(pid);
  });

  return groups;
};

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
      player1Wins: p2 === null ? 1 : 0, // Bye is a 1-0 win
      player2Wins: 0,
      draws: 0,
      status: p2 === null ? 'completed' : 'pending',
      createdAt: new Date()
    });
  }
  
  return matches;
};

export const generateRoundRobinMatches = async (
  eventId: string,
  playerIds: string[],
  groupId?: string,
  groupName?: string
) => {
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
          groupId,
          groupName,
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
          groupId,
          groupName,
          round,
          player1Id: realPlayer,
          player2Id: null,
          player1Wins: 0,
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

export const generateLeagueGroupsMatches = async (
  eventId: string,
  groups: TurtleGroup[]
) => {
  const allMatches: Omit<TurtleMatch, 'id'>[] = [];
  for (const group of groups) {
    const groupMatches = await generateRoundRobinMatches(
      eventId,
      group.playerIds,
      group.id,
      group.name
    );
    allMatches.push(...groupMatches);
  }
  return allMatches;
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

export const deleteRoundMatchesFromFirestore = async (matchIds: string[]) => {
  if (!matchIds || matchIds.length === 0) return;
  const batch = writeBatch(db);
  matchIds.forEach(id => {
    const docRef = doc(db, 'ts_matches', id);
    batch.delete(docRef);
  });
  await batch.commit();
};

export const generateSwissNextRound = async (
  eventId: string,
  currentMatches: TurtleMatch[],
  playerIds: string[],
  currentRound: number
) => {
  // 1. Gather all active participating players
  const playerSet = new Set<string>();
  (playerIds || []).forEach(id => {
    if (id) playerSet.add(id);
  });

  // Include any player who participated in prior matches of this event
  const priorMatches = currentMatches.filter(m => m.round <= currentRound);
  priorMatches.forEach(m => {
    if (m.player1Id) playerSet.add(m.player1Id);
    if (m.player2Id) playerSet.add(m.player2Id);
  });

  const allActivePlayers = Array.from(playerSet);
  if (allActivePlayers.length === 0) return [];

  // 2. Track past matchups and prior byes
  // opponentsPlayed: Map<playerId, Set<opponentId>>
  const opponentsPlayed = new Map<string, Set<string>>();
  const byesReceived = new Set<string>();
  allActivePlayers.forEach(p => opponentsPlayed.set(p, new Set<string>()));

  priorMatches.forEach(m => {
    if (m.player1Id && m.player2Id) {
      if (!opponentsPlayed.has(m.player1Id)) opponentsPlayed.set(m.player1Id, new Set());
      if (!opponentsPlayed.has(m.player2Id)) opponentsPlayed.set(m.player2Id, new Set());
      opponentsPlayed.get(m.player1Id)!.add(m.player2Id);
      opponentsPlayed.get(m.player2Id)!.add(m.player1Id);
    } else if (m.player1Id && !m.player2Id) {
      byesReceived.add(m.player1Id);
    } else if (!m.player1Id && m.player2Id) {
      byesReceived.add(m.player2Id);
    }
  });

  // 3. Calculate Swiss points up to currentRound
  const points = new Map<string, number>();
  allActivePlayers.forEach(p => points.set(p, 0));

  priorMatches.forEach(m => {
    if (m.status !== 'completed') return;

    if (!m.player2Id && m.player1Id) {
      // Bye awards 3 points
      points.set(m.player1Id, (points.get(m.player1Id) || 0) + 3);
    } else if (!m.player1Id && m.player2Id) {
      points.set(m.player2Id, (points.get(m.player2Id) || 0) + 3);
    } else if (m.player1Id && m.player2Id) {
      if (m.player1Wins > m.player2Wins) {
        points.set(m.player1Id, (points.get(m.player1Id) || 0) + 3);
      } else if (m.player2Wins > m.player1Wins) {
        points.set(m.player2Id, (points.get(m.player2Id) || 0) + 3);
      } else {
        // Tie / draw awards 1 point to each
        points.set(m.player1Id, (points.get(m.player1Id) || 0) + 1);
        points.set(m.player2Id, (points.get(m.player2Id) || 0) + 1);
      }
    }
  });

  const nextRoundMatches: Omit<TurtleMatch, 'id'>[] = [];
  let playersToPair = [...allActivePlayers];

  // 4. Handle odd number of players (BYE allocation)
  if (playersToPair.length % 2 !== 0) {
    // Candidates who haven't had a BYE yet
    let byeCandidates = playersToPair.filter(p => !byesReceived.has(p));
    if (byeCandidates.length === 0) {
      // If every player has already received a bye (rare), allow any player
      byeCandidates = [...playersToPair];
    }

    // Sort bye candidates by score ascending (lowest points get priority for BYE in Swiss)
    // Within same points, shuffle randomly to be completely fair
    const shuffledByeCandidates = shuffle(byeCandidates);
    shuffledByeCandidates.sort((a, b) => (points.get(a) || 0) - (points.get(b) || 0));

    const byePlayer = shuffledByeCandidates[0];
    playersToPair = playersToPair.filter(p => p !== byePlayer);

    nextRoundMatches.push({
      eventId,
      round: currentRound + 1,
      player1Id: byePlayer,
      player2Id: null,
      player1Wins: 1,
      player2Wins: 0,
      draws: 0,
      status: 'completed',
      createdAt: new Date()
    });
  }

  // 5. Backtracking Swiss Pairing Solver
  // Sort players primarily by points descending. Within same score, shuffle randomly.
  const shuffledPlayers = shuffle(playersToPair);
  shuffledPlayers.sort((a, b) => (points.get(b) || 0) - (points.get(a) || 0));

  // Recursive solver:
  // allowRematches: false for strict Swiss, true as ultimate fallback if mathematically unavoidable
  const solve = (unpaired: string[], allowRematches: boolean): [string, string][] | null => {
    if (unpaired.length === 0) return [];
    if (unpaired.length === 1) return null;

    const p1 = unpaired[0];
    const p1Points = points.get(p1) || 0;
    const p1History = opponentsPlayed.get(p1) || new Set<string>();

    let candidates = unpaired.slice(1);

    if (!allowRematches) {
      candidates = candidates.filter(c => !p1History.has(c));
      if (candidates.length === 0) return null;
    }

    // Order candidate opponents:
    // 1. Closest score distance first: |points(p1) - points(c)|
    // 2. If allowing rematches as fallback, prefer candidates who have NOT been played before
    candidates.sort((a, b) => {
      if (allowRematches) {
        const aPlayed = p1History.has(a) ? 1 : 0;
        const bPlayed = p1History.has(b) ? 1 : 0;
        if (aPlayed !== bPlayed) return aPlayed - bPlayed;
      }
      const diffA = Math.abs((points.get(a) || 0) - p1Points);
      const diffB = Math.abs((points.get(b) || 0) - p1Points);
      return diffA - diffB;
    });

    for (const p2 of candidates) {
      const remaining = unpaired.filter(p => p !== p1 && p !== p2);
      const subResult = solve(remaining, allowRematches);
      if (subResult !== null) {
        return [[p1, p2], ...subResult];
      }
    }

    return null;
  };

  // Attempt strict pairing first (guarantees NO player faces an opponent they already played)
  let pairings = solve(shuffledPlayers, false);

  // If impossible (only occurs if rounds > player count - 1), relax constraint to minimize rematches
  if (!pairings) {
    pairings = solve(shuffledPlayers, true);
  }

  // Absolute safety fallback
  if (!pairings) {
    pairings = [];
    for (let i = 0; i < shuffledPlayers.length; i += 2) {
      if (i + 1 < shuffledPlayers.length) {
        pairings.push([shuffledPlayers[i], shuffledPlayers[i + 1]]);
      }
    }
  }

  // 6. Convert pairs to match objects
  pairings.forEach(([p1, p2]) => {
    // 50% coin flip for table/side orientation
    const [first, second] = Math.random() > 0.5 ? [p1, p2] : [p2, p1];
    nextRoundMatches.push({
      eventId,
      round: currentRound + 1,
      player1Id: first,
      player2Id: second,
      player1Wins: 0,
      player2Wins: 0,
      draws: 0,
      status: 'pending',
      createdAt: new Date()
    });
  });

  return nextRoundMatches;
};

