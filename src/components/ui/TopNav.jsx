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

function BrandIcon() {
  return (
    <svg
      className={styles.brandIcon}
      width="22"
      height="22"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="13" cy="13" r="2.8" fill="currentColor" />
      <circle cx="13" cy="13" r="9.5" stroke="currentColor" strokeWidth="1.4"
        strokeDasharray="5 3.2" opacity="0.65" />
      <ellipse cx="13" cy="13" rx="9.5" ry="4.6" stroke="currentColor"
        strokeWidth="1" opacity="0.42" transform="rotate(-32 13 13)" />
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
          <BrandIcon />
          <span className={styles.wordmark}>RASVUYURO</span>
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
