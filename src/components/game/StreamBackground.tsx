/**
 * Game frame background:
 * 1) video (VITE_STREAM_URL), or
 * 2) static image (VITE_STREAM_IMAGE), or
 * 3) fallback gradient.
 */
export function StreamBackground() {
  const videoSrc = import.meta.env.VITE_STREAM_URL
  const imageSrc = import.meta.env.VITE_STREAM_IMAGE

  return (
    <div className="stream-bg" aria-hidden>
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
