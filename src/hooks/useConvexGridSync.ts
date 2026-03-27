import { useEffect, useRef } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { encodeState, decodeState } from '../components/grid/builder/storage'
import type { GridProjectsState } from '../components/grid/builder/types'

/**
 * Syncs GridProjectsState with Convex.
 * - On first load: restores state from Convex (calls onLoad when data arrives)
 * - On state change: debounces and saves to Convex
 */
export function useConvexGridSync(
  state: GridProjectsState,
  onLoad: (state: GridProjectsState) => void,
) {
  const rows = useQuery(api.grids.getProjects)
  const saveProjects = useMutation(api.grids.saveProjects)

  const initializedRef = useRef(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestState = useRef(state)
  latestState.current = state

  // Restore from Convex on first load
  useEffect(() => {
    if (initializedRef.current) return
    if (rows === undefined) return // still loading
    initializedRef.current = true

    if (rows && rows.length > 0) {
      const decoded = decodeState(rows[0].data)
      if (decoded) {
        onLoad(decoded)
        return
      }
    }
    // No cloud data — keep current (localStorage) state, but push it up
    saveProjects({ data: encodeState(latestState.current) }).catch(console.error)
  }, [rows, onLoad, saveProjects])

  // Debounced sync to Convex on every state change
  useEffect(() => {
    if (!initializedRef.current) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveProjects({ data: encodeState(latestState.current) }).catch(console.error)
    }, 1500)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, saveProjects])
}
