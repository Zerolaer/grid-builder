import { getFrameVisualState } from '../../game/frameState'
import { useGameState } from '../../game/GameContext'
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { DropletTimer } from './DropletTimer'
import { PerformanceOverlay } from './PerformanceOverlay'
import { RoundDevController } from './RoundDevController'
import { StreamBackground } from './StreamBackground'

const VIEWPORT_PRESETS = [
  { id: 'desktop-hd', width: 1920, height: 1080 },
  { id: 'desktop-mid', width: 1600, height: 900 },
  { id: 'tablet', width: 1024, height: 768 },
  { id: 'mobile', width: 390, height: 844 },
] as const

type ViewportPresetId = (typeof VIEWPORT_PRESETS)[number]['id']

export function GameFrame({ children }: { children: ReactNode }) {
  const state = useGameState()
  const frameState = getFrameVisualState(state)
  const [perfVisible, setPerfVisible] = useState(true)
  const [mobilePreviewEnabled, setMobilePreviewEnabled] = useState(false)
  const [viewportPresetId, setViewportPresetId] = useState<ViewportPresetId>('desktop-hd')
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 600px)').matches : false,
  )

  const viewportPreset = useMemo(
    () => VIEWPORT_PRESETS.find((preset) => preset.id === viewportPresetId) ?? VIEWPORT_PRESETS[0],
    [viewportPresetId],
  )

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(max-width: 600px)')
    const apply = () => setIsMobileViewport(media.matches)
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [])

  // Runtime device mode switches only by real viewport width (<600px).
  const runtimeMobileMode = isMobileViewport

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('iki-runtime:viewport-mode-changed', {
        detail: { mobile: runtimeMobileMode },
      }),
    )
  }, [runtimeMobileMode])

  return (
    <div
      className="game-frame-shell"
      data-frame-state={frameState}
      data-mobile-preview={mobilePreviewEnabled ? 'on' : 'off'}
      role="presentation"
    >
      <div className="game-frame">
        <StreamBackground />
        {!mobilePreviewEnabled && <DropletTimer />}
        <RoundDevController
          perfVisible={perfVisible}
          onTogglePerfVisible={() => setPerfVisible((prev) => !prev)}
          viewportPresetId={viewportPresetId}
          onChangeViewportPreset={setViewportPresetId}
          mobilePreviewEnabled={mobilePreviewEnabled}
          onToggleMobilePreview={() => setMobilePreviewEnabled((prev) => !prev)}
        />
        <PerformanceOverlay visible={perfVisible} />
        {mobilePreviewEnabled ? (
          <div
            className={`game-frame__viewport ${runtimeMobileMode ? 'is-mobile' : 'is-desktop'}`}
            style={
              {
                '--runtime-preview-width': `${viewportPreset.width}px`,
                '--runtime-preview-height': `${viewportPreset.height}px`,
              } as CSSProperties
            }
          >
            <div className="game-frame__content">{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
