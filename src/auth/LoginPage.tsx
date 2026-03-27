import { useState, type FormEvent } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'

export function LoginPage() {
  const { signIn } = useAuthActions()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const formData = new FormData()
      formData.set('email', email)
      formData.set('password', password)
      formData.set('flow', 'signIn')
      await signIn('password', formData)
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page login-page--builder">
      <div className="login-bg-orb login-bg-orb--lime" aria-hidden />
      <div className="login-bg-orb login-bg-orb--blue" aria-hidden />

      <div className="login-shell login-shell--centered">
        <section className="login-card">
          <div className="login-logo" aria-hidden>
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <rect x="1" y="1" width="40" height="40" rx="12" fill="rgba(255,255,255,0.04)" />
              <rect x="1" y="1" width="40" height="40" rx="12" stroke="rgba(255,255,255,0.12)" />
              <path d="M21 11v20M11 21h20" stroke="url(#g)" strokeWidth="2.4" strokeLinecap="round" />
              <defs>
                <linearGradient id="g" x1="10.5" y1="10.5" x2="31.5" y2="31.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#CEF600" />
                  <stop offset="1" stopColor="#95B2FF" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h2 className="login-title">SciBo</h2>
          <p className="login-subtitle">Internal workspace</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@scibo.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button
              type="submit"
              className="login-submit grid-builder-btn grid-builder-btn--primary"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
