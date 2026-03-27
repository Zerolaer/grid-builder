import { useState, type FormEvent } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'

type Mode = 'signIn' | 'signUp'

export function LoginPage() {
  const { signIn } = useAuthActions()
  const [mode, setMode] = useState<Mode>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
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
      formData.set('flow', mode)
      if (mode === 'signUp' && name) formData.set('name', name)
      await signIn('password', formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page login-page--builder">
      <div className="login-bg-orb login-bg-orb--lime" aria-hidden />
      <div className="login-bg-orb login-bg-orb--blue" aria-hidden />

      <div className="login-shell">
        <section className="login-showcase" aria-label="IKI-BUILDER interface style">
          <div className="login-showcase__badge">IKI-BUILDER UI</div>
          <h1 className="login-showcase__title">Design the table. Run the game.</h1>
          <p className="login-showcase__subtitle">
            One design language for the builder, live game view, and internal team tools.
          </p>

          <div className="login-showcase__chips">
            <span>Glass Panels</span>
            <span>Neon Accent</span>
            <span>Dark Surface</span>
          </div>

          <div className="login-showcase__preview" aria-hidden>
            <div className="login-showcase__preview-head" />
            <div className="login-showcase__preview-grid">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </section>

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

          <h2 className="login-title">IKI-BUILDER</h2>
          <p className="login-subtitle">
            {mode === 'signIn' ? 'Sign in to your workspace' : 'Create a new account'}
          </p>

          <div className="login-mode-toggle" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signIn'}
              className={`login-mode-toggle__btn ${mode === 'signIn' ? 'is-active' : ''}`}
              onClick={() => { setMode('signIn'); setError(null) }}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signUp'}
              className={`login-mode-toggle__btn ${mode === 'signUp' ? 'is-active' : ''}`}
              onClick={() => { setMode('signUp'); setError(null) }}
            >
              Sign Up
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {mode === 'signUp' && (
              <div className="login-field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="How should we call you?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@iki-builder.app"
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
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-submit grid-builder-btn grid-builder-btn--primary" disabled={loading}>
              {loading ? 'Checking...' : mode === 'signIn' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="login-hint">
            {mode === 'signIn'
              ? "Don't have an account? Switch to sign up."
              : 'Already registered? Switch to sign in.'}
          </p>
        </section>
      </div>
    </div>
  )
}
