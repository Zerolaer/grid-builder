import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { encodeState, decodeState } from '../components/grid/builder/storage'
import type { GridProjectsState } from '../components/grid/builder/types'

/**
 * Syncs GridProjectsState with Convex.
 * - On first load: restores state from Convex (calls onLoad when data arrives)
 * - On state change: debounces and saves to Convex
 */
type UseConvexGridSyncOptions = {
  autoSync?: boolean
}

type ConvexGridSyncStatus = 'loading' | 'saving' | 'saved' | 'error'
const DIRECT_SAVE_MAX_BYTES = 900 * 1024
const CHUNK_CHAR_SIZE = 300_000

function hashString(input: string): string {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return String(hash >>> 0)
}

function splitToChunks(value: string, chunkSize: number): string[] {
  if (value.length <= chunkSize) return [value]
  const chunks: string[] = []
  for (let i = 0; i < value.length; i += chunkSize) {
    chunks.push(value.slice(i, i + chunkSize))
  }
  return chunks
}

function createUploadId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function useConvexGridSync(
  state: GridProjectsState,
  onLoad: (state: GridProjectsState) => void,
  options?: UseConvexGridSyncOptions,
) {
  const [status, setStatus] = useState<ConvexGridSyncStatus>('loading')
  const rows = useQuery(api.grids.getProjects)
  const saveProjects = useMutation(api.grids.saveProjects)
  const saveProjectsChunk = useMutation((api as any).grids.saveProjectsChunk) as (args: {
    uploadId: string
    chunkIndex: number
    totalChunks: number
    data: string
  }) => Promise<unknown>
  const autoSync = options?.autoSync ?? true

  const initializedRef = useRef(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestState = useRef(state)
  latestState.current = state
  const lastSavedHashRef = useRef<string | null>(null)

  const saveNowRef = useRef<() => Promise<boolean>>(async () => false)
  saveNowRef.current = async () => {
    const payload = encodeState(latestState.current)
    const payloadHash = hashString(payload)
    if (payloadHash === lastSavedHashRef.current) {
      setStatus('saved')
      return true
    }
    setStatus('saving')
    try {
      const payloadBytes = new Blob([payload]).size
      if (payloadBytes <= DIRECT_SAVE_MAX_BYTES) {
        await saveProjects({ data: payload })
      } else {
        const chunks = splitToChunks(payload, CHUNK_CHAR_SIZE)
        const uploadId = createUploadId()
        for (let i = 0; i < chunks.length; i += 1) {
          await saveProjectsChunk({
            uploadId,
            chunkIndex: i,
            totalChunks: chunks.length,
            data: chunks[i],
          })
        }
      }
      lastSavedHashRef.current = payloadHash
      setStatus('saved')
      return true
    } catch (error) {
      console.error(error)
      setStatus('error')
      return false
    }
  }

  // Restore from Convex on first load
  useEffect(() => {
    if (initializedRef.current) return
    if (rows === undefined) return // still loading
    initializedRef.current = true

    if (rows && rows.length > 0) {
      lastSavedHashRef.current = hashString(rows[0].data)
      const decoded = decodeState(rows[0].data)
      if (decoded) {
        onLoad(decoded)
        setStatus('saved')
        return
      }
    }
    // No cloud data: in local-only mode we do not push anything automatically.
    if (!autoSync) {
      setStatus('saved')
      return
    }

    // Cloud auto mode: seed cloud with current local state if it fits limits.
    void saveNowRef.current()
  }, [rows, onLoad, saveProjects, autoSync])

  // Debounced sync to Convex on every state change
  useEffect(() => {
    if (!autoSync) return
    if (!initializedRef.current) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setStatus('saving')
    saveTimer.current = setTimeout(() => {
      const payload = encodeState(latestState.current)
      const payloadHash = hashString(payload)
      if (payloadHash === lastSavedHashRef.current) {
        setStatus('saved')
        return
      }
      const payloadBytes = new Blob([payload]).size
      const savePromise =
        payloadBytes <= DIRECT_SAVE_MAX_BYTES
          ? saveProjects({ data: payload })
          : (async () => {
              const chunks = splitToChunks(payload, CHUNK_CHAR_SIZE)
              const uploadId = createUploadId()
              for (let i = 0; i < chunks.length; i += 1) {
                await saveProjectsChunk({
                  uploadId,
                  chunkIndex: i,
                  totalChunks: chunks.length,
                  data: chunks[i],
                })
              }
            })()
      savePromise
        .then(() => {
          lastSavedHashRef.current = payloadHash
          setStatus('saved')
        })
        .catch((error) => {
          console.error(error)
          setStatus('error')
        })
    }, 1500)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, saveProjects, saveProjectsChunk, autoSync])

  return {
    status,
    saveNow: () => saveNowRef.current(),
  }
}
