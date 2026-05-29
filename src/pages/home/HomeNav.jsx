import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import styles from './home.module.css'

function BrandIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <circle cx="13" cy="13" r="2.8" fill="#f26a21" />
      <circle cx="13" cy="13" r="9.5" stroke="#f26a21" strokeWidth="1.4"
        strokeDasharray="5 3.2" opacity="0.65" />
      <ellipse cx="13" cy="13" rx="9.5" ry="4.6" stroke="#f26a21" strokeWidth="1"
        opacity="0.42" transform="rotate(-32 13 13)" />
    </svg>
  )
}

function IconGrid() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1" width="5" height="5" rx="1" />
      <rect x="8" y="1" width="5" height="5" rx="1" />
      <rect x="1" y="8" width="5" height="5" rx="1" />
      <rect x="8" y="8" width="5" height="5" rx="1" />
    </svg>
  )
}

function IconFilm() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <rect x="1" y="3" width="12" height="8" rx="1" fillOpacity="0" stroke="currentColor" strokeWidth="1.3" />
      <rect x="1" y="5"  width="2.5" height="1.4" rx="0.4" />
      <rect x="1" y="7.6" width="2.5" height="1.4" rx="0.4" />
      <rect x="10.5" y="5"   width="2.5" height="1.4" rx="0.4" />
      <rect x="10.5" y="7.6" width="2.5" height="1.4" rx="0.4" />
      <line x1="4" y1="3" x2="4" y2="11" stroke="currentColor" strokeWidth="0.8" />
      <line x1="10" y1="3" x2="10" y2="11" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4.2" stroke="currentColor" strokeWidth="1.4" />
      <line x1="9.2" y1="9.2" x2="12.5" y2="12.5" stroke="currentColor"
        strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

const NAV_LINKS = [
  { to: '/collections', label: 'კოლექციები', Icon: IconGrid  },
  { to: '/movies',      label: 'ფილმები',     Icon: IconFilm  },
]

export default function HomeNav() {
  const navigate    = useNavigate()
  const searchRef   = useRef(null)
  const debounceRef = useRef(null)
  const [inputVal, setInputVal] = useState('')

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  function focusSearch() {
    searchRef.current?.focus()
  }

  function handleChange(e) {
    const val = e.target.value
    setInputVal(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (val.trim()) navigate(`/movies?q=${encodeURIComponent(val.trim())}`)
      else            navigate('/movies')
    }, 280)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setInputVal('')
      clearTimeout(debounceRef.current)
      searchRef.current?.blur()
    }
    if (e.key === 'Enter' && inputVal.trim()) {
      clearTimeout(debounceRef.current)
      navigate(`/movies?q=${encodeURIComponent(inputVal.trim())}`)
    }
  }

  return (
    <nav className={styles.nav} aria-label="Homepage navigation">

      {/* Brand */}
      <Link to="/" className={styles.brand}>
        <BrandIcon />
        <span className={styles.brandName}>RASVUYURO</span>
      </Link>

      {/* Center links */}
      <div className={styles.navLinks}>
        {NAV_LINKS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.navLink}${isActive ? ' ' + styles.navLinkActive : ''}`
            }
          >
            <span className={styles.navLinkIcon}><Icon /></span>
            {label}
          </NavLink>
        ))}

        {/* Search shortcut — focuses the search input */}
        <button type="button" className={styles.navLink} onClick={focusSearch}
          aria-label="ძებნა">
          <span className={styles.navLinkIcon}><IconSearch /></span>
          ძებნა
        </button>
      </div>

      {/* Right: search + avatar */}
      <div className={styles.navRight}>
        {/* Mobile: icon-only — hidden on desktop via CSS */}
        <button type="button" className={styles.mobileSearchBtn}
          onClick={() => navigate('/movies')}
          aria-label="ფილმის ძებნა">
          <IconSearch />
        </button>

        {/* Desktop: full text input — hidden on mobile via CSS */}
        <div className={styles.searchWrap}>
          <input
            ref={searchRef}
            type="search"
            className={styles.searchInput}
            placeholder="ფილმის ძებნა..."
            aria-label="ფილმის ძებნა"
            value={inputVal}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button type="button" className={styles.avatarBtn} aria-label="User menu" />
      </div>

    </nav>
  )
}
