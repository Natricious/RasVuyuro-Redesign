import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Rail } from '../components/ui/Rail'
import styles from './Home.module.css'

// Only what the hero needs — no backdrop_url NOT NULL filter so we always get a result
const HERO_FIELDS = 'id,title,title_ge,year,imdb_rating,genres,themes,tone,poster,description,description_ka'

const RAILS = [
  {
    title:          'ქართული ახალი ტალღა',
    kicker:         '1980–2000 · ავტორული კინო',
    filter:         { column: 'timeline', value: ['georgian'] },
    fallbackOffset: 0,
    linkTo:         '/movies',
  },
  {
    title:          'კრიტიკოსების არჩევანი',
    kicker:         'ყველაზე მაღალი IMDb შეფასება',
    filter:         null,
    fallbackOffset: 0,
    linkTo:         '/movies',
  },
  {
    title:          'წვიმიანი დღისთვის',
    kicker:         'ატმოსფერული · ნელი · სათბური',
    filter:         { column: 'tone', value: ['melancholic'] },
    fallbackOffset: 20,
    linkTo:         '/movies',
  },
  {
    title:          'შუაღამისთვის',
    kicker:         'ღამის 12-ის შემდეგ',
    filter:         { column: 'tone', value: ['dark'] },
    fallbackOffset: 40,
    linkTo:         '/movies',
  },
]

export default function Home() {
  const [featured, setFeatured]       = useState(null)
  const [heroLoading, setHeroLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('movies')
      .select(HERO_FIELDS)
      .order('imdb_rating', { ascending: false })
      .limit(1)
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) {
          console.error('[Home] hero query error:', err)
        } else if (data?.length) {
          setFeatured(data[0])
        }
        setHeroLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const synopsis = featured?.description_ka || featured?.description

  return (
    <div>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className={styles.hero} aria-label="Featured film">
        {heroLoading && <div className={styles.heroSkeleton} />}

        {featured && (
          <>
            <div className={styles.heroBg}>
              {featured.poster && <img src={featured.poster} alt="" />}
            </div>

            <div className={styles.heroContent}>
              {/* Poster */}
              <div className={styles.heroPoster}>
                {featured.poster && (
                  <img src={featured.poster} alt={featured.title} />
                )}
              </div>

              {/* Info */}
              <div className={styles.heroInfo}>
                <span className={styles.badge}>▲ ტრენდი ამ კვირას</span>

                <h1 className={styles.heroTitle}>{featured.title}</h1>

                {featured.title_ge && (
                  <p className={styles.heroTitleEn}>{featured.title_ge}</p>
                )}

                <div className={styles.credits}>
                  {featured.year && <span>{featured.year}</span>}
                </div>

                {Array.isArray(featured.genres) && featured.genres.length > 0 && (
                  <div className={styles.genreRow}>
                    {featured.genres.slice(0, 3).map(g => (
                      <span key={g} className={styles.genrePill}>{g}</span>
                    ))}
                  </div>
                )}

                <div className={styles.stats}>
                  {featured.imdb_rating != null && (
                    <div className={styles.stat}>
                      <span className={styles.statValue}>
                        ★ {Number(featured.imdb_rating).toFixed(1)}
                      </span>
                      <span className={styles.statLabel}>IMDb</span>
                    </div>
                  )}
                  <span className={styles.statDivider} />
                  <div className={styles.stat}>
                    <span className={styles.statValue}>98%</span>
                    <span className={styles.statLabel}>Match</span>
                  </div>
                </div>

                {synopsis && (
                  <p className={styles.synopsis}>{synopsis}</p>
                )}

                <div className={styles.heroActions}>
                  <Link to={`/movie/${featured.id}`} className={styles.btnPrimary}>
                    დეტალურად
                  </Link>
                  <button type="button" className={styles.btnSecondary}>
                    + სიაში დამატება
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── Rails ───────────────────────────────────────────── */}
      <main className={styles.rails} aria-label="Film collections">
        {RAILS.map(rail => (
          <Rail
            key={rail.title}
            title={rail.title}
            kicker={rail.kicker}
            filter={rail.filter}
            fallbackOffset={rail.fallbackOffset}
            linkTo={rail.linkTo}
          />
        ))}
      </main>

      {/* ── Wizard CTA ──────────────────────────────────────── */}
      <section className={styles.wizard} aria-label="Film wizard">
        <div className={styles.wizardContent}>
          <span className={styles.wizardIcon} aria-hidden="true">✦</span>
          <h2 className={styles.wizardTitle}>ვერ ირჩევ, რა ნახო?</h2>
          <p className={styles.wizardSub}>
            უპასუხე რამდენიმე კითხვას — ჩვენი ჯადოქარი შენთვის ფილმს შეარჩევს.
          </p>
          <Link to="/wizard" className={styles.wizardBtn}>
            სცადე ჯადოქარი
          </Link>
        </div>
      </section>

    </div>
  )
}
