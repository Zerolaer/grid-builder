import type { GameState } from './types'

/**
 * Visual game-frame glow state (do not confuse with GamePhase).
 * - open: betting is open (green)
 * - closing: last seconds before close (orange)
 * - ended: betting is closed (red)
 */
export type FrameVisualState = 'open' | 'closing' | 'ended'

/** Number of seconds for the "orange" pre-close phase. */
export const FRAME_CLOSING_LAST_SEC = 3

export function getFrameVisualState(state: GameState): FrameVisualState {
  if (state.phase === 'bets_closed') return 'ended'
  if (state.phase === 'betting') {
    if (
      state.countdownSec > 0 &&
      state.countdownSec <= FRAME_CLOSING_LAST_SEC
    ) {
      return 'closing'
    }
    return 'open'
  }
  return 'open'
}
