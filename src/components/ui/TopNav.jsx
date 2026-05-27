import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useNavigate, useSearchParams } from 'react-router-dom'
import styles from './TopNav.module.css'

const NAV_LINKS = [
  { to: '/',            label: 'მთავარი',    end: true    },
  { to: '/movies',      label: 'ფილმები',                 },
  { to: '/collections', label: 'კოლექციები',              },
  { to: '/wizard',      label: 'ჯადოქარი',  accent: true  },
  { to: '/mine',        label: 'ჩემი',                    },
]

function FilmstripIcon() {
  return (
    <svg
      className={styles.brandIcon}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="1" y="4" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="1"  y1="8"  x2="21" y2="8"  stroke="currentColor" strokeWidth="1.25" />
      <line x1="1"  y1="14" x2="21" y2="14" stroke="currentColor" strokeWidth="1.25" />
      <rect x="4"   y="4.5"  width="2" height="3" rx="0.5" />
      <rect x="9"   y="4.5"  width="2" height="3" rx="0.5" />
      <rect x="14"  y="4.5"  width="2" height="3" rx="0.5" />
      <rect x="4"   y="14.5" width="2" height="3" rx="0.5" />
      <rect x="9"   y="14.5" width="2" height="3" rx="0.5" />
      <rect x="14"  y="14.5" width="2" height="3" rx="0.5" />
    </svg>
  )
}

function HamburgerIcon({ open }) {
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {open
        ? <>
            <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </>
        : <>
            <line x1="3" y1="5.5"  x2="17" y2="5.5"  stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <line x1="3" y1="10"   x2="17" y2="10"    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <line x1="3" y1="14.5" x2="17" y2="14.5"  stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </>
      }
    </svg>
  )
}

export function TopNav() {
  const navigate                  = useNavigate()
  const [searchParams]            = useSearchParams()
  const inputRef                  = useRef(null)
  const debounceRef               = useRef(null)
  const [menuOpen, setMenuOpen]   = useState(false)

  const urlQ = searchParams.get('q') ?? ''
  const [inputVal, setInputVal]   = useState(urlQ)

  // Keep input in sync when user navigates via browser back/forward
  useEffect(() => {
    setInputVal(urlQ)
  }, [urlQ])

  // Cancel any pending debounce on unmount
  useEffect(() => () => clearTimeout(debounceRef.current), [])

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function handleChange(e) {
    const val = e.target.value
    setInputVal(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      // Preserve any existing params (e.g. genre) when navigating to /movies
      const next = new URLSearchParams(searchParams)
      if (val.trim()) next.set('q', val.trim())
      else            next.delete('q')
      navigate(`/movies?${next}`)
    }, 280)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setInputVal('')
      clearTimeout(debounceRef.current)
      navigate('/movies')
      inputRef.current?.blur()
    }
  }

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <div className={styles.inner}>

        {/* Left — brand */}
        <Link to="/" className={styles.brand}>
          <FilmstripIcon />
          <span className={styles.wordmark}>CineGuide</span>
        </Link>

        {/* Center — nav links (hidden on mobile) */}
        <div className={styles.links} role="list">
          {NAV_LINKS.map(({ to, label, end, accent }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              role="listitem"
              className={({ isActive }) =>
                [
                  styles.link,
                  isActive && styles.linkActive,
                  accent   && styles.linkAccent,
                ].filter(Boolean).join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right — search + avatar (search hidden on mobile) */}
        <div className={styles.actions}>
          <div className={styles.searchWrap}>
            <input
              ref={inputRef}
              type="search"
              className={styles.search}
              placeholder="ძიება..."
              aria-label="ფილმის ძიება"
              value={inputVal}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
            <kbd className={styles.kbd}>⌘K</kbd>
          </div>

          <button
            type="button"
            className={styles.avatar}
            aria-label="User menu"
          />

          {/* Hamburger — visible on mobile only */}
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'მენიუს დახურვა' : 'მენიუს გახსნა'}
            aria-expanded={menuOpen}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>

      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {NAV_LINKS.map(({ to, label, end, accent }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                [
                  styles.mobileLink,
                  isActive && styles.mobileLinkActive,
                  accent   && styles.mobileLinkAccent,
                ].filter(Boolean).join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
