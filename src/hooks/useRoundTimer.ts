import { useEffect } from 'react'
import { useGameDispatch, useGameState } from '../game/GameContext'

/** Mock behavior: timer ticks once per second during the betting phase. */
export function useRoundTimer(): void {
  const { phase, countdownSec } = useGameState()
  const dispatch = useGameDispatch()

  useEffect(() => {
    if (phase !== 'betting' || countdownSec <= 0) return
    const id = window.setInterval(() => {
      dispatch({ type: 'TICK' })
    }, 1000)
    return () => window.clearInterval(id)
  }, [phase, countdownSec, dispatch])
}
