import { useEffect } from 'react'
import { Routes, Route, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { TopNav }          from './components/ui/TopNav'
import { Footer }          from './components/ui/Footer'
import Home                from './pages/Home'
import Browse              from './pages/Browse'
import MovieDetail         from './pages/MovieDetail'
import Collections         from './pages/Collections'
import CollectionDetail    from './pages/CollectionDetail'

/* ── Scroll to top on every route change ───────────────────── */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/* ── Shared layout wrapper ──────────────────────────────────── */
function Layout() {
  return (
    <>
      <ScrollToTop />
      <TopNav />
      <Outlet />
      <Footer />
    </>
  )
}

/* ── Generic placeholder for unbuilt pages ──────────────────── */
function Placeholder({ label }) {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    }}>
      <p style={{
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--ink-3)',
      }}>
        {label}
      </p>
      <p style={{ fontSize: '13px', color: 'var(--ink-4)' }}>მალე</p>
    </div>
  )
}

/* ── 404 ────────────────────────────────────────────────────── */
function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      textAlign: 'center',
      padding: '24px',
    }}>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 'clamp(72px, 12vw, 120px)',
        color: 'var(--ink-4)',
        letterSpacing: 'var(--tracking-display)',
        lineHeight: 1,
      }}>
        404
      </span>
      <p style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
        გვერდი ვერ მოიძებნა
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        style={{
          height: '40px',
          padding: '0 24px',
          background: 'transparent',
          color: 'var(--ink-2)',
          fontSize: '14px',
          fontFamily: 'var(--font-body)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
        }}
      >
        ← მთავარი
      </button>
    </div>
  )
}

/* ── Homepage layout — no TopNav (HomeNav renders inside Home.jsx) */
function HomepageLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
      <Footer />
    </>
  )
}

/* ── Route table ────────────────────────────────────────────── */
export default function App() {
  return (
    <Routes>
      {/* Homepage uses its own nav — TopNav excluded */}
      <Route element={<HomepageLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* All other pages use the shared Layout with TopNav */}
      <Route element={<Layout />}>
        <Route path="/movies"    element={<Browse />}      />
        <Route path="/movie/:id" element={<MovieDetail />} />

        {/* Collections — landing grid + per-collection detail */}
        <Route path="/collections"       element={<Collections />}      />
        <Route path="/collections/:slug" element={<CollectionDetail />} />

        {/* Placeholder pages — built later */}
        <Route path="/wizard"  element={<Placeholder label="ჯადოქარი" />} />
        <Route path="/mine"    element={<Placeholder label="ჩემი სია"  />} />
        <Route path="/profile" element={<Placeholder label="პროფილი"   />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
