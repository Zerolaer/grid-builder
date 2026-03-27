import { useState } from 'react'
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

  async function handleSubmit(e: React.FormEvent) {
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
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo" aria-hidden>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="rgba(255,255,255,0.06)" />
            <path d="M10 20h20M20 10v20" stroke="url(#g)" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="g" x1="10" y1="10" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ece9e1" />
                <stop offset="1" stopColor="#afa483" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className="login-title">SciBo</h1>
        <p className="login-subtitle">
          {mode === 'signIn' ? 'Sign in to your account' : 'Create a new account'}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === 'signUp' && (
            <div className="login-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
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
              placeholder="you@example.com"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signIn' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="login-toggle">
          {mode === 'signIn' ? "Don't have an account?" : 'Already have an account?'}
          {' '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'signIn' ? 'signUp' : 'signIn'); setError(null) }}
          >
            {mode === 'signIn' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
