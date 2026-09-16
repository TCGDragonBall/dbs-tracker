export type EventType = 'tournament' | 'league';
export type GameFormat = 'masters' | 'fusion_world';
export type EventStructure = 'swiss' | 'swiss_top' | 'groups';
export type EventStatus = 'open' | 'ongoing' | 'completed';

export interface TurtleEvent {
  id: string;
  type: EventType;
  name: string;
  gameFormat: GameFormat;
  structure: EventStructure;
  startDate: string;
  startTime?: string;
  entryFee: number;
  description: string;
  status: EventStatus;
  botPlayers?: { userId: string; displayName: string; status: string }[];
  createdAt: any;
}

export interface TurtleRegistration {
  id: string;
  userId: string;
  eventId: string;
  status: 'pending' | 'paid';
  decklistUrl?: string;
  createdAt: any;
}

export interface TurtleMatch {
  id: string;
  eventId: string;
  round: number;
  player1Id: string;
  player2Id: string | null; // null if bye
  player1Wins: number;
  player2Wins: number;
  draws: number;
  player1LeaderId?: string;
  player2LeaderId?: string;
  status: 'pending' | 'completed';
  createdAt: any;
}
