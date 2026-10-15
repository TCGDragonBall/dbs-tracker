import { TurtleEvent, TurtleMatch, TurtleRegistration, TurtleUserInfo } from './types';

export interface PlayerLeaderItem {
  key: string;
  displayCode: string;
  cardId: string;
  name?: string;
  imageUrl?: string;
  backImageUrl?: string;
  color?: string;
  rarity?: string;
  power?: string;
  card?: any;
}

export interface PlayerStanding {
  userId: string;
  name: string; // Nombre oficial mostrado en la clasificación
  officialName: string; // Nombre oficial del jugador (nick sugerido en mis datos)
  accountName?: string; // Nombre de cuenta / Google / original
  discordUsername?: string; // Nick / Discord
  fullName?: string; // Nombre real de envío
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
  leaderDetails: PlayerLeaderItem[];
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
 * Ensures an image URL from dragonball.center or relative paths is absolute.
 */
export function formatCardImageUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('/')) {
    return `https://dragonball.center${url}`;
  }
  return url;
}

/**
 * Validates that a card is strictly a standard Leader and NOT a Z-Leader, Battle card, etc.
 */
export function isOnlyLeaderCard(card: any): boolean {
  if (!card || !card.type) return false;
  const t = String(card.type).trim().toLowerCase();
  // Must be leader
  if (!t.includes('leader') && !t.includes('líder')) return false;
  // Exclude Z-Leader cards explicitly
  if (
    t.includes('z-leader') || 
    t.includes('z-lider') || 
    t.includes('z líder') || 
    t.includes('z leader') || 
    t.startsWith('z-') || 
    t.startsWith('z ')
  ) {
    return false;
  }
  // Exclude if rarity denotes Z-Leader
  const r = String(card.rarity || '').trim().toLowerCase();
  if (r.includes('z-leader') || r.includes('z-lider')) {
    return false;
  }
  return true;
}

/**
 * Normalizes leader card name to a clean comparable string.
 * Strips special symbols, extra spaces, slashes (/ or //) so that
 * variants, promos, and alternate arts of the same leader match accurately.
 */
function normalizeLeaderName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[\/\\]+/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Searches for a leader card in the cards catalog using multiple strategies:
 * 1. Exact match on id or cardNumber (case-insensitive)
 * 2. Variant-stripped match (e.g., P-111_PR -> P-111, BT1-001_SPR -> BT1-001)
 * 3. Leading-zero normalization (e.g., P-11 -> P-011, P-011 -> P-11)
 */
export function findLeaderCard(cardIdOrNumber: string, cards?: any[]): any | undefined {
  if (!cardIdOrNumber || !cards || !Array.isArray(cards) || cards.length === 0) return undefined;

  const raw = cardIdOrNumber.trim();
  const rawLower = raw.toLowerCase();

  // 1. Exact match on id or cardNumber
  let found = cards.find(c => 
    c.id?.toLowerCase() === rawLower || 
    c.cardNumber?.toLowerCase() === rawLower
  );
  if (found) return found;

  // 2. Suffix stripped match (_PR, _SPR, _JP01, _p1, -alt, etc.)
  const stripped = raw.split('_')[0].split('-alt')[0].split('-Alt')[0].trim();
  const strippedLower = stripped.toLowerCase();
  found = cards.find(c => 
    c.id?.toLowerCase() === strippedLower || 
    c.cardNumber?.toLowerCase() === strippedLower
  );
  if (found) return found;

  // 3. Numeric zero-padding or unpadding (e.g. P-11 <-> P-011, P-1 <-> P-001)
  const numMatch = stripped.match(/^([A-Za-z]+[0-9]*-)0*(\d+)$/i);
  if (numMatch) {
    const prefix = numMatch[1].toUpperCase();
    const num = parseInt(numMatch[2], 10);
    const p3 = `${prefix}${String(num).padStart(3, '0')}`.toLowerCase();
    const p2 = `${prefix}${String(num).padStart(2, '0')}`.toLowerCase();
    const pUnpadded = `${prefix}${num}`.toLowerCase();

    found = cards.find(c => {
      const cId = c.id?.toLowerCase() || '';
      const cNum = c.cardNumber?.toLowerCase() || '';
      const cIdBase = cId.split('_')[0];
      const cNumBase = cNum.split('_')[0];
      return (
        cIdBase === p3 || cIdBase === p2 || cIdBase === pUnpadded ||
        cNumBase === p3 || cNumBase === p2 || cNumBase === pUnpadded
      );
    });
    if (found) return found;
  }

  return undefined;
}

/**
 * Returns a canonical identity key and display code for a leader card.
 * Different versions or alternate arts of the SAME leader (e.g. P-111 and P-111_PR,
 * or P-111 and P-11_PR, or BT1-030 and BT1-030_PR, or FB01-001 and FB01-001_A)
 * will produce the exact same canonical identity key, ensuring they count
 * as only 1 leader in league standings.
 */
export function getLeaderIdentity(cardIdOrNumber: string, cards?: any[]): { key: string; displayCode: string } {
  if (!cardIdOrNumber) return { key: '', displayCode: '' };

  const foundCard = findLeaderCard(cardIdOrNumber, cards);

  // Determine base display code
  let rawCode = foundCard?.cardNumber || foundCard?.id || cardIdOrNumber;
  let baseCode = rawCode.split('_')[0].split('-alt')[0].split('-Alt')[0].trim().toUpperCase();

  // Normalize promo number formatting (e.g. P-11 -> P-011)
  const pMatch = baseCode.match(/^([A-Z]+)-0*(\d+)$/);
  if (pMatch) {
    const prefix = pMatch[1];
    const num = parseInt(pMatch[2], 10);
    if (prefix === 'P' && num < 1000) {
      baseCode = `P-${String(num).padStart(3, '0')}`;
    }
  }

  // Canonical identity key:
  // In DBSCG, alternate arts/reprints/promo variants of the same leader card
  // always share the exact same card name (Front // Back).
  if (foundCard?.name) {
    const normName = normalizeLeaderName(foundCard.name);
    if (normName) {
      return {
        key: `NAME:${normName}`,
        displayCode: baseCode
      };
    }
  }

  return {
    key: `CODE:${baseCode}`,
    displayCode: baseCode
  };
}

/**
 * Extracts the original BT/base card number from a leader card ID or number.
 * Alternative versions (e.g. BT1-001_SPR, BT1-001_JP04, FB01-001_Alt, P-111_PR) 
 * will map to the original base number (BT1-001, FB01-001, P-111).
 */
export function getBaseLeaderCode(cardIdOrNumber: string, cards?: any[]): string {
  const identity = getLeaderIdentity(cardIdOrNumber, cards);
  return identity.displayCode;
}

/**
 * Calculates league and tournament standings according to the official rules:
 * - Match Win = 3 points
 * - Match Loss = 0 points
 * - Unique Leader played = 1 point (max 4 points total) - ONLY in leagues
 * - Alternate arts / promo versions of the same leader count as 1 leader
 * - Admin Adjustments: deduction for unplayed matches / penalties, and disqualification (DQ)
 */
export function calculateLeagueStandings(
  event: TurtleEvent,
  matches: TurtleMatch[],
  registrations: TurtleRegistration[],
  usersInfo: Record<string, TurtleUserInfo | { displayName: string; email?: string; [key: string]: any }>,
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
    uniqueLeadersMap: Map<string, PlayerLeaderItem>; // canonicalKey -> PlayerLeaderItem
  }> = {};

  allUserIds.forEach(uid => {
    statsMap[uid] = {
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      gameWins: 0,
      gameLosses: 0,
      uniqueLeadersMap: new Map<string, PlayerLeaderItem>()
    };
  });

  // Process completed matches
  matches.forEach(m => {
    if (m.status !== 'completed') return;

    // In leagues, Byes / rest rounds (odd number of players where a player rests)
    // DO NOT count as a match or win, and do NOT award any points or game wins!
    if (event.type === 'league' && (!m.player1Id || !m.player2Id)) {
      return;
    }

    // Player 1 processing
    if (m.player1Id && statsMap[m.player1Id]) {
      const p1 = statsMap[m.player1Id];
      p1.matchesPlayed++;
      p1.gameWins += m.player1Wins || 0;
      p1.gameLosses += m.player2Wins || 0;

      if (m.player1Wins > m.player2Wins) {
        p1.wins++;
      } else if (m.player1Wins < m.player2Wins) {
        p1.losses++;
      }

      if (m.player1LeaderId) {
        const { key, displayCode } = getLeaderIdentity(m.player1LeaderId, cards);
        if (key && !p1.uniqueLeadersMap.has(key)) {
          const cardObj = findLeaderCard(m.player1LeaderId, cards) || findLeaderCard(displayCode, cards);
          p1.uniqueLeadersMap.set(key, {
            key,
            displayCode,
            cardId: m.player1LeaderId,
            name: cardObj?.name,
            imageUrl: formatCardImageUrl(cardObj?.imageUrl),
            backImageUrl: formatCardImageUrl(cardObj?.backImageUrl),
            color: cardObj?.color,
            rarity: cardObj?.rarity,
            power: cardObj?.power,
            card: cardObj
          });
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
      } else if (m.player2Wins < m.player1Wins) {
        p2.losses++;
      }

      if (m.player2LeaderId) {
        const { key, displayCode } = getLeaderIdentity(m.player2LeaderId, cards);
        if (key && !p2.uniqueLeadersMap.has(key)) {
          const cardObj = findLeaderCard(m.player2LeaderId, cards) || findLeaderCard(displayCode, cards);
          p2.uniqueLeadersMap.set(key, {
            key,
            displayCode,
            cardId: m.player2LeaderId,
            name: cardObj?.name,
            imageUrl: formatCardImageUrl(cardObj?.imageUrl),
            backImageUrl: formatCardImageUrl(cardObj?.backImageUrl),
            color: cardObj?.color,
            rarity: cardObj?.rarity,
            power: cardObj?.power,
            card: cardObj
          });
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
      uniqueLeadersMap: new Map<string, PlayerLeaderItem>()
    };

    const isBot = botMap.has(uid);
    const uInfo = usersInfo[uid] as TurtleUserInfo | undefined;

    // Official tournament name: Player's configured official name/nick from "Mis Datos",
    // falling back to discordUsername, displayName, or 'Unknown Player'
    const officialName = isBot
      ? botMap.get(uid)!
      : (uInfo?.officialName?.trim() || uInfo?.discordUsername?.trim() || uInfo?.displayName?.trim() || 'Unknown Player');

    const accountName = isBot ? 'Bot' : (uInfo?.accountName || uInfo?.displayName || '');
    const discordUsername = isBot ? '' : (uInfo?.discordUsername || '');
    const fullName = isBot ? '' : (uInfo?.fullName || '');
    const email = isBot ? 'bot' : usersInfo[uid]?.email;

    const leaderDetails = Array.from(raw.uniqueLeadersMap.values());
    const uniqueBaseLeaders = leaderDetails.map(l => l.displayCode);
    const uniqueLeaderCount = raw.uniqueLeadersMap.size;

    // Scoring rules:
    // Victoria = 3 puntos
    // Derrota = 0 puntos
    // Líder único jugado = 1 punto (max 4 pts) - SOLO para Ligas (event.type === 'league')
    // Para torneos normales, sólo se suman 3 puntos por victoria (sin puntuación extra de líderes)
    const isLeague = event.type === 'league';
    const winPoints = raw.wins * 3;
    const leaderPoints = isLeague ? Math.min(4, uniqueLeaderCount) : 0;
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
      name: officialName,
      officialName,
      accountName,
      discordUsername,
      fullName,
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
      leaderDetails,
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
  // 5. Unique leaders played descending (only for leagues)
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

    if (event.type === 'league' && b.uniqueLeaderCount !== a.uniqueLeaderCount) {
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
