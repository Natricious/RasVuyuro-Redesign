import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const COLUMNS = [
  {
    title: 'ფილმები',
    links: [
      { label: 'ახლახან დამატებული', to: '/movies' },
      { label: 'საუკეთესო რეიტინგი', to: '/movies' },
      { label: 'ჟანრების მიხედვით',  to: '/movies'          },
      { label: 'კოლექციები',          to: '/collections'     },
    ],
  },
  {
    title: 'პლატფორმა',
    links: [
      { label: 'ჩვენს შესახებ',  to: '/about'   },
      { label: 'ჯადოქარი',       to: '/wizard'  },
      { label: 'ჩემი სია',       to: '/mine'    },
      { label: 'კონტაქტი',       to: '/contact' },
    ],
  },
  {
    title: 'სხვა',
    links: [
      { label: 'კონფიდენციალობა',   to: '/privacy' },
      { label: 'გამოყენების წესები', to: '/terms'   },
      { label: 'FAQ',                to: '/faq'     },
    ],
  },
]

function FilmstripIcon() {
  return (
    <svg
      className={styles.brandIcon}
      width="20"
      height="20"
      viewBox="0 0 22 22"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="1" y="4" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="1"  y1="8"  x2="21" y2="8"  stroke="currentColor" strokeWidth="1.25" />
      <line x1="1"  y1="14" x2="21" y2="14" stroke="currentColor" strokeWidth="1.25" />
      <rect x="4"  y="4.5"  width="2" height="3" rx="0.5" />
      <rect x="9"  y="4.5"  width="2" height="3" rx="0.5" />
      <rect x="14" y="4.5"  width="2" height="3" rx="0.5" />
      <rect x="4"  y="14.5" width="2" height="3" rx="0.5" />
      <rect x="9"  y="14.5" width="2" height="3" rx="0.5" />
      <rect x="14" y="14.5" width="2" height="3" rx="0.5" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.body}>

        {/* Brand column */}
        <div className={styles.brand}>
          <Link to="/" className={styles.brandLink}>
            <FilmstripIcon />
            <span className={styles.wordmark}>CineGuide</span>
          </Link>
          <p className={styles.tagline}>
            ქართული კინოს სამყარო ერთ პლატფორმაზე.
          </p>
        </div>

        {/* Link columns */}
        <div className={styles.columns}>
          {COLUMNS.map(col => (
            <div key={col.title} className={styles.column}>
              <span className={styles.columnTitle}>{col.title}</span>
              {col.links.map(({ label, to }) => (
                <Link key={to} to={to} className={styles.columnLink}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>

      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span className={styles.copy}>
            © {new Date().getFullYear()} CineGuide. ყველა უფლება დაცულია.
          </span>
          <nav className={styles.legal} aria-label="Legal links">
            <Link to="/privacy" className={styles.legalLink}>კონფიდენციალობა</Link>
            <Link to="/terms"   className={styles.legalLink}>პირობები</Link>
            <Link to="/cookies" className={styles.legalLink}>Cookies</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
