/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PARENT_ORIGIN?: string
  /** YouTube URL used as background stream behind static image */
  readonly VITE_STREAM_YOUTUBE_URL?: string
  /** Stream URL (mp4 / HLS, depending on player) for game frame background */
  readonly VITE_STREAM_URL?: string
  /** Static background image for testing (e.g. /stream-test.jpg) */
  readonly VITE_STREAM_IMAGE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
