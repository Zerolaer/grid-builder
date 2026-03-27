import { useGame } from '../../game/GameContext'
import type { GamePhase, GridViewState } from '../../game/types'
import { useEffect, useRef, useState } from 'react'
import {
  GRID_PACKAGE_EVENT,
  loadGridProjectsState,
  publishGridProjectsState,
  saveGridProjectsState,
} from '../grid/builder/storage'
import type { GridProjectsState } from '../grid/builder/types'

const PHASE_OPTIONS: Array<{ value: GamePhase; label: string }> = [
  { value: 'betting', label: 'Open' },
  { value: 'bets_closed', label: 'Closed' },
]

const GRID_VIEW_STATE_OPTIONS: Array<{ value: GridViewState; label: string }> = [
  { value: 'auto', label: 'Auto (by game phase)' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
]

const VIEWPORT_PRESETS = [
  { id: 'desktop-hd', label: 'Desktop 1920x1080', width: 1920, height: 1080 },
  { id: 'desktop-mid', label: 'Desktop 1600x900', width: 1600, height: 900 },
  { id: 'tablet', label: 'Tablet 1024x768', width: 1024, height: 768 },
  { id: 'mobile', label: 'Mobile 390x844', width: 390, height: 844 },
] as const

type ViewportPresetId = (typeof VIEWPORT_PRESETS)[number]['id']

type RoundDevControllerProps = {
  perfVisible: boolean
  onTogglePerfVisible: () => void
  viewportPresetId: ViewportPresetId
  onChangeViewportPreset: (presetId: ViewportPresetId) => void
  mobilePreviewEnabled: boolean
  onToggleMobilePreview: () => void
}

export function RoundDevController({
  perfVisible,
  onTogglePerfVisible,
  viewportPresetId,
  onChangeViewportPreset,
  mobilePreviewEnabled,
  onToggleMobilePreview,
}: RoundDevControllerProps) {
  const { state, dispatch } = useGame()
  const [gridProjectsState, setGridProjectsState] = useState<GridProjectsState>(() =>
    loadGridProjectsState(),
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Only sync on explicit publish — NOT on every localStorage save
    const sync = () => setGridProjectsState(loadGridProjectsState())
    window.addEventListener(GRID_PACKAGE_EVENT, sync as EventListener)
    return () => {
      window.removeEventListener(GRID_PACKAGE_EVENT, sync as EventListener)
    }
  }, [])

  const switchGridProject = (projectId: string) => {
    const current = loadGridProjectsState()
    if (!current.projects.some((project) => project.id === projectId)) return
    const next = { ...current, activeProjectId: projectId }
    saveGridProjectsState(next)
    publishGridProjectsState(next)
    setGridProjectsState((prev) => ({
      ...prev,
      activeProjectId: projectId,
    }))
  }

  const quickSetBettingOpen = () => {
    // "Betting Open" acts as round reset + explicit open grid state.
    dispatch({ type: 'RESET_ROUND' })
    dispatch({ type: 'SET_GRID_VIEW_STATE', gridViewState: 'open' })
  }

  const quickSetBettingClosed = () => {
    dispatch({ type: 'SET_PHASE', phase: 'bets_closed' })
    dispatch({ type: 'SET_GRID_VIEW_STATE', gridViewState: 'closed' })
  }

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current
      const target = event.target
      if (!root || !(target instanceof Node)) return
      if (!root.contains(target)) setMenuOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  return (
    <div className="round-dev-controller" ref={rootRef}>
      <button
        type="button"
        className="round-dev-controller__trigger"
        aria-expanded={menuOpen}
        aria-haspopup="true"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        Admin Panel
      </button>

      <button
        type="button"
        className="round-dev-controller__quick round-dev-controller__quick--open"
        onClick={quickSetBettingOpen}
        title="Betting Open"
        aria-label="Betting Open"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M20 5v5h-5M4 19v-5h5M6.7 9.2A7 7 0 0 1 18.4 7M17.3 14.8A7 7 0 0 1 5.6 17"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        type="button"
        className="round-dev-controller__quick round-dev-controller__quick--closed"
        onClick={quickSetBettingClosed}
        title="Betting Closed"
        aria-label="Betting Closed"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7.5 7.5l9 9M16.5 7.5l-9 9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>

      {menuOpen ? (
        <div className="round-dev-controller__menu" role="dialog" aria-label="Admin panel controls">
          <label className="round-dev-controller__label" htmlFor="grid-project-select">
            Grid Project
          </label>
          <select
            id="grid-project-select"
            className="round-dev-controller__select"
            value={gridProjectsState.activeProjectId}
            onChange={(e) => switchGridProject(e.target.value)}
          >
            {gridProjectsState.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <label className="round-dev-controller__label" htmlFor="viewport-preset-select">
            Resolution Preset
          </label>
          <select
            id="viewport-preset-select"
            className="round-dev-controller__select"
            value={viewportPresetId}
            onChange={(e) => onChangeViewportPreset(e.target.value as ViewportPresetId)}
          >
            {VIEWPORT_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>

          <label className="round-dev-controller__toggle">
            <input
              type="checkbox"
              checked={mobilePreviewEnabled}
              onChange={onToggleMobilePreview}
            />
            <span>Mobile Preview Mode</span>
          </label>

          <label className="round-dev-controller__label" htmlFor="round-phase-select">
            Game State
          </label>
          <select
            id="round-phase-select"
            className="round-dev-controller__select"
            value={state.phase}
            onChange={(e) =>
              dispatch({
                type: 'SET_PHASE',
                phase: e.target.value as GamePhase,
              })
            }
          >
            {PHASE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="round-dev-controller__label" htmlFor="grid-view-state-select">
            Grid State
          </label>
          <select
            id="grid-view-state-select"
            className="round-dev-controller__select"
            value={state.gridViewState}
            onChange={(e) =>
              dispatch({
                type: 'SET_GRID_VIEW_STATE',
                gridViewState: e.target.value as GridViewState,
              })
            }
          >
            {GRID_VIEW_STATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="round-dev-controller__button"
            onClick={onTogglePerfVisible}
          >
            {perfVisible ? 'Hide Performance Panel' : 'Show Performance Panel'}
          </button>

          <a
            className="round-dev-controller__link"
            href="/dev/grid-builder"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Grid Builder
          </a>
        </div>
      ) : null}
    </div>
  )
}
