/**
 * Game frame background:
 * 1) YouTube embed behind stream image (VITE_STREAM_YOUTUBE_URL),
 * 2) direct video (VITE_STREAM_URL),
 * 3) static image (VITE_STREAM_IMAGE),
 * 4) fallback gradient.
 */
export function StreamBackground() {
  const youtubeUrl = import.meta.env.VITE_STREAM_YOUTUBE_URL ?? 'https://www.youtube.com/watch?v=jfKfPfyJRdk'
  const videoSrc = import.meta.env.VITE_STREAM_URL
  const imageSrc = import.meta.env.VITE_STREAM_IMAGE
  const youtubeVideoId = extractYoutubeVideoId(youtubeUrl)
  const youtubeEmbedSrc = youtubeVideoId
    ? `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeVideoId}&playsinline=1&rel=0&modestbranding=1`
    : null

  return (
    <div className="stream-bg" aria-hidden>
      {youtubeEmbedSrc ? (
        <iframe
          className="stream-bg__media stream-bg__media--youtube"
          src={youtubeEmbedSrc}
          title="Background YouTube stream"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : null}
      {videoSrc ? (
        <video
          className="stream-bg__media"
          src={videoSrc}
          autoPlay
          muted
          playsInline
          loop
        />
      ) : null}
      {!videoSrc && imageSrc ? (
        <img className="stream-bg__media stream-bg__media--image" src={imageSrc} alt="" />
      ) : null}
      {!videoSrc && !imageSrc ? <div className="stream-bg__fallback" /> : null}
      <div className="stream-bg__overlay" />
    </div>
  )
}

function extractYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      return parsed.pathname.slice(1) || null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v')
      }
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/')[2] || null
      }
    }
  } catch {
    return null
  }
  return null
}
