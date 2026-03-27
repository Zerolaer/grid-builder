import { useAuthActions } from '@convex-dev/auth/react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'

export function ProfileButton() {
  const { signOut } = useAuthActions()
  const viewer = useQuery(api.users.viewer)
  const [open, setOpen] = useState(false)

  const initials = viewer?.name
    ? viewer.name.slice(0, 2).toUpperCase()
    : viewer?.email?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="profile-btn-wrap">
      <button
        type="button"
        className="profile-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Profile"
        title={viewer?.email ?? 'Profile'}
      >
        <span className="profile-btn__avatar">{initials}</span>
      </button>

      {open && (
        <>
          <div className="profile-backdrop" onClick={() => setOpen(false)} />
          <div className="profile-dropdown">
            <div className="profile-dropdown__info">
              {viewer?.name && <p className="profile-dropdown__name">{viewer.name}</p>}
              <p className="profile-dropdown__email">{viewer?.email}</p>
            </div>
            <hr className="profile-dropdown__hr" />
            <button
              type="button"
              className="profile-dropdown__signout"
              onClick={() => { void signOut(); setOpen(false) }}
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
