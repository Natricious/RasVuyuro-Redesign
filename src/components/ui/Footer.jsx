import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const COLUMNS = [
  {
    title: 'ფილმები',
    links: [
      { label: 'ახლახან დამატებული', to: '/movies'      },
      { label: 'საუკეთესო რეიტინგი', to: '/movies'      },
      { label: 'ჟანრების მიხედვით',  to: '/movies'      },
      { label: 'კოლექციები',         to: '/collections' },
    ],
  },
  {
    title: 'პლატფორმა',
    links: [
      { label: 'ჯადოქარი', to: '/wizard' },
      { label: 'ჩემი სია', to: '/mine'   },
    ],
  },
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

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.body}>

        {/* Brand column */}
        <div className={styles.brand}>
          <Link to="/" className={styles.brandLink}>
            <BrandIcon />
            <span className={styles.wordmark}>RASVUYURO</span>
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
                <Link key={label} to={to} className={styles.columnLink}>
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
          <div className={styles.legal}>
            <span className={styles.legalLink}>კონფიდენციალობა</span>
            <span className={styles.legalLink}>პირობები</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
