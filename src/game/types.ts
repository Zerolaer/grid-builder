/** Round phases; grid-facing flow is open -> closed. */
export type GamePhase = 'betting' | 'bets_closed'
export type GridViewState = 'auto' | 'open' | 'closed'

export type ChipValue = 1 | 2 | 5 | 10 | 25 | 50 | 100 | 250

/** Betting zone identifier on the grid (extend as new bet types are added). */
export type BetZoneId =
  | 'small'
  | 'big'
  | 'any_triple'
  | 'odd'
  | 'even'
  | `total_${4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17}`
  | `double_${1 | 2 | 3 | 4 | 5 | 6}`
  | `side_double_${1 | 2 | 3 | 4 | 5 | 6}`
  | `single_${1 | 2 | 3 | 4 | 5 | 6}`
  | `triple_${111 | 222 | 333 | 444 | 555 | 666}`

export type BetMap = Partial<Record<BetZoneId, number>>

export interface PlacedBet {
  zoneId: BetZoneId
  amount: number
}

export interface GameState {
  phase: GamePhase
  gridViewState: GridViewState
  /** Seconds until bet intake closes (mock for now; server-driven later). */
  countdownSec: number
  balance: number
  totalBet: number
  selectedChip: ChipValue
  bets: BetMap
  /** Undo history (order in which bets were placed). */
  betStack: PlacedBet[]
  /** Recent outcomes for roadmap UI (mock data). */
  roadmap: Array<'S' | 'B' | 'T'>
  gameId: string
  limitsLabel: string
}
