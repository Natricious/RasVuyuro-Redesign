import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import styles from './home.module.css'

// ── Floating poster slot definitions ─────────────────────────────
const POSTER_SLOTS = [
  { left:  '74px', top:  '92px', w: 218, h: 392, rotY:  11 },
  { left: '322px', top: '104px', w: 116, h: 188, rotY:  13 },
  { left: '340px', top: '322px', w:  90, h: 150, rotY:  11 },
  { right:'430px', top: '104px', w:  92, h: 186, rotY: -13 },
  { right:'290px', top: '110px', w: 168, h: 368, rotY:  -9 },
  { right:'100px', top: '188px', w: 118, h: 228, rotY: -15 },
]

// ── Deterministic xorshift RNG ───────────────────────────────────
let _seed = 4242
function rnd() {
  _seed ^= _seed << 13
  _seed ^= _seed >> 17
  _seed ^= _seed << 5
  return (_seed >>> 0) / 0x100000000
}

// ── Value noise ──────────────────────────────────────────────────
function hash(n) { const x = Math.sin(n) * 43758.5453123; return x - Math.floor(x) }
function fract(x) { return x - Math.floor(x) }

function vnoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = fract(x),      fy = fract(y)
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const a  = hash(ix     + iy     * 57)
  const b  = hash(ix + 1 + iy     * 57)
  const c  = hash(ix     + (iy+1) * 57)
  const d  = hash(ix + 1 + (iy+1) * 57)
  return a + (b-a)*ux + (c-a)*uy + (d-b-c+a)*ux*uy
}

function fbm(x, y, oct = 4) {
  let v = 0, amp = 0.5, freq = 1
  for (let i = 0; i < oct; i++) {
    v += amp * vnoise(x * freq, y * freq)
    amp *= 0.5; freq *= 2.07
  }
  return v
}

// ── Color helpers ────────────────────────────────────────────────
const colHot    = [255, 248, 232]
const colOrange = [255, 146, 54]
const colDeep   = [216, 80,  28]
const colEmber  = [150, 54,  22]

function mix(a, b, t) {
  const s = Math.max(0, Math.min(1, t))
  return [(a[0] + (b[0]-a[0])*s) | 0,
          (a[1] + (b[1]-a[1])*s) | 0,
          (a[2] + (b[2]-a[2])*s) | 0]
}

function colAt(rn) {
  if (rn < 0.42) return mix(colHot, colOrange, rn / 0.42)
  if (rn < 0.78) return mix(colOrange, colDeep, (rn - 0.42) / 0.36)
  return mix(colDeep, colEmber, Math.min(1, (rn - 0.78) / 0.22))
}

function rgba(col, a) {
  return `rgba(${col[0]},${col[1]},${col[2]},${a.toFixed(3)})`
}

// ── Portal renderer ──────────────────────────────────────────────
// size  = 620 (display px). Canvas buffer = size*dpr.
// N     = round(size * dpr) — controls density of all passes.
function renderPortal(ctx, size, dpr) {
  // Reset RNG to same seed every render for consistent texture
  _seed = 4242

  const px  = Math.round(size * dpr)
  const R   = px * 0.5
  const cx  = R, cy = R
  const N   = Math.round(size * dpr)

  ctx.clearRect(0, 0, px, px)
  ctx.globalCompositeOperation = 'lighter'

  // Blob helper (normalised coords −1…1)
  function blob(nx, ny, col, a, sz) {
    if (sz < 0.5) return
    const gx = cx + nx * R
    const gy = cy + ny * R
    const g  = ctx.createRadialGradient(gx, gy, 0, gx, gy, sz)
    g.addColorStop(0,   rgba(col, a))
    g.addColorStop(0.4, rgba(col, a * 0.42))
    g.addColorStop(1,   rgba(col, 0))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(gx, gy, sz, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 1. Band blobs (bandPk=0.66, range 0.40–0.99) ───────────────
  const NB = Math.round(N * 0.8)
  for (let i = 0; i < NB; i++) {
    const ang = rnd() * Math.PI * 2
    const rn  = 0.40 + rnd() * 0.59
    blob(Math.cos(ang) * rn,
         Math.sin(ang) * rn,
         colAt(rn),
         0.030 + rnd() * 0.065,
         R * (0.055 + rnd() * 0.110))
  }

  // ── 2. Swirl arcs — tangential motion-blur light bands ──────────
  // 16 segments per arc, sin-envelope fade at both ends.
  // FBM perturbs radius per-segment for organic waviness.
  const NA = Math.round(N * 1.0)
  ctx.lineCap  = 'round'
  ctx.lineJoin = 'round'

  for (let i = 0; i < NA; i++) {
    const theta0  = rnd() * Math.PI * 2
    const rn0     = 0.42 + Math.pow(rnd(), 0.8) * 0.55  // 0.42–0.97
    const span    = 0.12 + rnd() * 0.62                  // 0.12–0.74 rad
    const dir     = rnd() > 0.5 ? 1 : -1
    const env     = rnd()
    const col     = colAt(rn0)
    const lw      = (0.5 + rnd() * 1.6) * dpr * (0.6 + env)
    const drAmp   = 0.015 + rnd() * 0.040
    const drFreq  = 2.0   + rnd() * 4.0

    ctx.lineWidth = lw

    const SEG = 16
    for (let s = 0; s < SEG; s++) {
      const t0   = s       / SEG
      const t1   = (s + 1) / SEG
      const tMid = (t0 + t1) * 0.5
      const envS = Math.sin(tMid * Math.PI) * env
      const a    = 0.04 + envS * 0.38

      ctx.strokeStyle = rgba(col, a)

      const a0  = theta0 + dir * span * t0
      const a1  = theta0 + dir * span * t1
      const fb0 = fbm(Math.cos(a0) * drFreq, Math.sin(a0) * drFreq, 3)
      const fb1 = fbm(Math.cos(a1) * drFreq, Math.sin(a1) * drFreq, 3)
      const r0  = (rn0 + (fb0 - 0.5) * drAmp) * R
      const r1  = (rn0 + (fb1 - 0.5) * drAmp) * R

      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0)
      ctx.lineTo(cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1)
      ctx.stroke()
    }
  }

  // ── 3. Ember blobs ───────────────────────────────────────────────
  const NE = Math.round(N * 0.9)
  for (let i = 0; i < NE; i++) {
    const ang  = rnd() * Math.PI * 2
    const rn   = 0.40 + rnd() * 0.59
    const fbv  = fbm(Math.cos(ang) * 3, Math.sin(ang) * 3, 4)
    const rOff = (fbv - 0.5) * 0.15
    const rt   = Math.max(0.02, Math.min(0.99, rn + rOff))
    blob(Math.cos(ang) * rt,
         Math.sin(ang) * rt,
         colAt(rn),
         0.09 + rnd() * 0.20,
         R * (0.018 + rnd() * 0.044))
  }

  // ── 4. Hot streaks — short bright arcs ──────────────────────────
  const NH = Math.round(N * 0.16)
  for (let i = 0; i < NH; i++) {
    const theta0 = rnd() * Math.PI * 2
    const rn0    = 0.32 + rnd() * 0.62
    const span   = 0.03 + rnd() * 0.18
    const dir    = rnd() > 0.5 ? 1 : -1
    const col    = colAt(rn0)
    const lw     = (1.0 + rnd() * 2.5) * dpr
    ctx.lineWidth = lw

    const SEG = 8
    for (let s = 0; s < SEG; s++) {
      const t0  = s       / SEG
      const t1  = (s + 1) / SEG
      const tM  = (t0 + t1) * 0.5
      const a   = 0.15 + Math.sin(tM * Math.PI) * 0.45
      ctx.strokeStyle = rgba(col, a)
      const a0  = theta0 + dir * span * t0
      const a1  = theta0 + dir * span * t1
      const fb0 = fbm(Math.cos(a0) * 4, Math.sin(a0) * 4, 3)
      const fb1 = fbm(Math.cos(a1) * 4, Math.sin(a1) * 4, 3)
      const r0  = (rn0 + (fb0 - 0.5) * 0.02) * R
      const r1  = (rn0 + (fb1 - 0.5) * 0.02) * R
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0)
      ctx.lineTo(cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1)
      ctx.stroke()
    }
  }

  // ── 5. Far glow at center ────────────────────────────────────────
  blob(0, 0, colHot,    0.50, R * 0.04)
  blob(0, 0, colOrange, 0.26, R * 0.095)
}

// ── HomeHero ──────────────────────────────────────────────────────
export default function HomeHero() {
  const bloomRef = useRef(null)
  const sharpRef = useRef(null)
  const [movies, setMovies] = useState([])

  // Fetch 6 movies for floating poster cards
  useEffect(() => {
    supabase
      .from('movies')
      .select('id,title,poster')
      .not('poster', 'is', null)
      .order('imdb_rating', { ascending: false })
      .limit(6)
      .then(({ data }) => { if (data) setMovies(data) })
  }, [])

  // Portal canvas — render once, re-render on resize
  useEffect(() => {
    const bloomC = bloomRef.current
    const sharpC = sharpRef.current
    if (!bloomC || !sharpC) return

    const off = document.createElement('canvas')

    function draw() {
      const dpr  = Math.min(window.devicePixelRatio || 1, 2)
      const size = 620
      const px   = Math.round(size * dpr)

      off.width  = px
      off.height = px
      renderPortal(off.getContext('2d'), size, dpr)

      ;[bloomC, sharpC].forEach(c => {
        c.width        = px
        c.height       = px
        c.style.width  = `${size}px`
        c.style.height = `${size}px`
        const ctx = c.getContext('2d')
        ctx.clearRect(0, 0, px, px)
        ctx.drawImage(off, 0, 0)
      })
    }

    draw()

    let timer = null
    function onResize() { clearTimeout(timer); timer = setTimeout(draw, 150) }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); clearTimeout(timer) }
  }, [])

  return (
    <section className={styles.hero}>

      {/* Portal */}
      <div className={styles.portalWrap}>
        <div className={styles.ambient} />
        <div className={styles.tilt}>
          <div className={styles.spin}>
            <canvas ref={bloomRef} id="hp-bloom" className={styles.bloom} />
            <canvas ref={sharpRef} id="hp-sharp" className={styles.sharp} />
          </div>
        </div>
        <div className={styles.pBurst}  />
        <div className={styles.pStreak} />
        <div className={styles.pDown}   />
      </div>

      {/* Floating poster cards */}
      {POSTER_SLOTS.map((slot, i) => {
        const movie = movies[i]
        return (
          <div
            key={i}
            className={styles.floatingPoster}
            style={{
              top:             slot.top,
              left:            slot.left,
              right:           slot.right,
              width:           `${slot.w}px`,
              height:          `${slot.h}px`,
              transform:       `perspective(800px) rotateY(${slot.rotY}deg)`,
              backgroundImage: movie?.poster ? `url(${movie.poster})` : undefined,
            }}
          >
            {movie?.title && (
              <p className={styles.posterTitle}>{movie.title}</p>
            )}
          </div>
        )
      })}

      {/* Content */}
      <div className={styles.heroContent}>
        <div className={styles.kicker}>✦ ჯადოქარი შენი ფილმებისთვის</div>

        <h1 className={styles.h1}>
          <span className={styles.h1Accent}>რას</span>{' '}ვუყურო?
        </h1>

        <p className={styles.subhead}>
          ნუ დახარჯავ ნახევარ საათს არჩევაში. უპასუხე ოთხ კითხვას —
          ჩვენი ჯადოქარი შეარჩევს ზუსტ ფილმს.
        </p>

        <div className={styles.actions}>
          <Link to="/wizard" className={styles.btnPrimary}>
            ✦&nbsp;ჯადოქრის დაწყება
          </Link>
          <Link to="/collections" className={styles.btnGhost}>
            კოლექციების დათვალიერება
          </Link>
        </div>

        <div className={styles.meta}>
          <span>6,000+ ფილმი</span>
          <span className={styles.metaDot}>·</span>
          <span>4 შეკითხვა</span>
          <span className={styles.metaDot}>·</span>
          <span>1 იდეალური არჩევანი</span>
        </div>
      </div>

    </section>
  )
}
