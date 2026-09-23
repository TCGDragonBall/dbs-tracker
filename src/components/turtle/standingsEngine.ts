import { TurtleEvent, TurtleMatch, TurtleRegistration } from './types';

export interface PlayerStanding {
  userId: string;
  name: string;
  email?: string;
  isBot?: boolean;
  matchesPlayed: number;
  wins: number;
  losses: number;
  gameWins: number;
  gameLosses: number;
  gameDiff: number;
  uniqueBaseLeaders: string[];
  uniqueLeaderCount: number;
  winPoints: number; // 3 points per win
  leaderPoints: number; // 1 point per unique leader, max 4
  rawPoints: number; // winPoints + leaderPoints
  penaltyPoints: number; // subtracted by admin for unplayed matches, etc.
  penaltyReason?: string;
  isDisqualified: boolean;
  finalPoints: number; // 0 if disqualified else Math.max(0, rawPoints - penaltyPoints)
  rank: number;
}

/**
 * Extracts the original BT/base card number from a leader card ID or number.
 * Alternative versions (e.g. BT1-001_SPR, BT1-001_JP04, FB01-001_Alt) 
 * will map to the original base number (BT1-001, FB01-001).
 */
export function getBaseLeaderCode(cardIdOrNumber: string, cards?: any[]): string {
  if (!cardIdOrNumber) return '';

  let codeToInspect = cardIdOrNumber;

  // If card catalog is provided, try to find the canonical cardNumber
  if (cards && Array.isArray(cards) && cards.length > 0) {
    const foundCard = cards.find(c => c.id === cardIdOrNumber || c.cardNumber === cardIdOrNumber);
    if (foundCard) {
      codeToInspect = foundCard.cardNumber || foundCard.id || cardIdOrNumber;
    }
  }

  // Remove suffixes after '_' (e.g., BT1-001_SPR -> BT1-001, BT1-001_JP04_L2 -> BT1-001)
  const base = codeToInspect.split('_')[0].trim().toUpperCase();
  return base;
}

/**
 * Calculates league and tournament standings according to the official rules:
 * - Match Win = 3 points
 * - Match Loss = 0 points
 * - Unique Leader played = 1 point (max 4 points total)
 * - Admin Adjustments: deduction for unplayed matches / penalties, and disqualification (DQ)
 */
export function calculateLeagueStandings(
  event: TurtleEvent,
  matches: TurtleMatch[],
  registrations: TurtleRegistration[],
  usersInfo: Record<string, { displayName: string; email?: string }>,
  cards?: any[]
): PlayerStanding[] {
  // Collect all player IDs (registered users + bots)
  const allUserIds = new Set<string>();
  const botMap = new Map<string, string>();

  registrations.forEach(r => allUserIds.add(r.userId));

  if (event.botPlayers) {
    event.botPlayers.forEach(b => {
      allUserIds.add(b.userId);
      botMap.set(b.userId, b.displayName);
    });
  }

  // Initialize stats dictionary
  const statsMap: Record<string, {
    matchesPlayed: number;
    wins: number;
    losses: number;
    gameWins: number;
    gameLosses: number;
    uniqueLeadersSet: Set<string>;
  }> = {};

  allUserIds.forEach(uid => {
    statsMap[uid] = {
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      gameWins: 0,
      gameLosses: 0,
      uniqueLeadersSet: new Set<string>()
    };
  });

  // Process completed matches
  matches.forEach(m => {
    if (m.status !== 'completed') return;

    // Player 1 processing
    if (m.player1Id && statsMap[m.player1Id]) {
      const p1 = statsMap[m.player1Id];
      p1.matchesPlayed++;
      p1.gameWins += m.player1Wins || 0;
      p1.gameLosses += m.player2Wins || 0;

      if (m.player1Wins > m.player2Wins) {
        p1.wins++;
      } else if (m.player2Id && m.player1Wins < m.player2Wins) {
        p1.losses++;
      }

      if (m.player1LeaderId) {
        const baseLeader = getBaseLeaderCode(m.player1LeaderId, cards);
        if (baseLeader) {
          p1.uniqueLeadersSet.add(baseLeader);
        }
      }
    }

    // Player 2 processing (if not a BYE)
    if (m.player2Id && statsMap[m.player2Id]) {
      const p2 = statsMap[m.player2Id];
      p2.matchesPlayed++;
      p2.gameWins += m.player2Wins || 0;
      p2.gameLosses += m.player1Wins || 0;

      if (m.player2Wins > m.player1Wins) {
        p2.wins++;
      } else if (m.player1Wins < m.player2Wins) {
        p2.losses++;
      }

      if (m.player2LeaderId) {
        const baseLeader = getBaseLeaderCode(m.player2LeaderId, cards);
        if (baseLeader) {
          p2.uniqueLeadersSet.add(baseLeader);
        }
      }
    }
  });

  // Calculate scores and apply admin adjustments
  const list: PlayerStanding[] = Array.from(allUserIds).map(uid => {
    const raw = statsMap[uid] || {
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      gameWins: 0,
      gameLosses: 0,
      uniqueLeadersSet: new Set<string>()
    };

    const isBot = botMap.has(uid);
    const displayName = isBot
      ? botMap.get(uid)!
      : (usersInfo[uid]?.displayName || 'Unknown Player');
    const email = isBot ? 'bot' : usersInfo[uid]?.email;

    const uniqueBaseLeaders = Array.from(raw.uniqueLeadersSet);
    const uniqueLeaderCount = uniqueBaseLeaders.length;

    // League scoring rules:
    // Victoria = 3 puntos
    // Derrota = 0 puntos
    // Líder único jugado = 1 punto (max 4)
    const winPoints = raw.wins * 3;
    const leaderPoints = Math.min(4, uniqueLeaderCount);
    const rawPoints = winPoints + leaderPoints;

    // Admin adjustments (penalties for unplayed matches or DQ)
    const adj = event.adminAdjustments?.[uid];
    const penaltyPoints = adj?.penaltyPoints ? Math.max(0, adj.penaltyPoints) : 0;
    const penaltyReason = adj?.notes || '';
    const isDisqualified = !!adj?.disqualified;

    const finalPoints = isDisqualified ? 0 : Math.max(0, rawPoints - penaltyPoints);
    const gameDiff = raw.gameWins - raw.gameLosses;

    return {
      userId: uid,
      name: displayName,
      email,
      isBot,
      matchesPlayed: raw.matchesPlayed,
      wins: raw.wins,
      losses: raw.losses,
      gameWins: raw.gameWins,
      gameLosses: raw.gameLosses,
      gameDiff,
      uniqueBaseLeaders,
      uniqueLeaderCount,
      winPoints,
      leaderPoints,
      rawPoints,
      penaltyPoints,
      penaltyReason,
      isDisqualified,
      finalPoints,
      rank: 1
    };
  });

  // Sort standings:
  // 1. Non-disqualified first, Disqualified (DQ) at bottom
  // 2. Final Points descending
  // 3. Game difference (gameWins - gameLosses) descending
  // 4. Match wins descending
  // 5. Unique leaders played descending
  // 6. Name alphabetical
  list.sort((a, b) => {
    if (a.isDisqualified && !b.isDisqualified) return 1;
    if (!a.isDisqualified && b.isDisqualified) return -1;

    if (b.finalPoints !== a.finalPoints) {
      return b.finalPoints - a.finalPoints;
    }

    if (b.gameDiff !== a.gameDiff) {
      return b.gameDiff - a.gameDiff;
    }

    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }

    if (b.uniqueLeaderCount !== a.uniqueLeaderCount) {
      return b.uniqueLeaderCount - a.uniqueLeaderCount;
    }

    return a.name.localeCompare(b.name);
  });

  // Assign ranks
  list.forEach((p, idx) => {
    p.rank = idx + 1;
  });

  return list;
}
