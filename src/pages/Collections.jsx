import { Link } from 'react-router-dom'
import { useCollections } from '../hooks/useCollections'
import styles from './Collections.module.css'

const SKELETONS = Array.from({ length: 12 })

function CollectionCard({ collection: col }) {
  const hasBg = Boolean(col.image_url)
  const accent = col.color || 'var(--accent)'

  return (
    <Link to={`/collections/${col.slug}`} className={styles.card}>
      {hasBg
        ? <div className={styles.cardBg} style={{ backgroundImage: `url(${col.image_url})` }} />
        : <div className={styles.cardBgGrad} style={{
            background: `linear-gradient(135deg, ${accent}28 0%, var(--bg-2) 100%)`
          }} />
      }
      <div className={styles.cardOverlay} />
      {col.color && <span className={styles.cardAccent} style={{ background: col.color }} />}
      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle}>{col.title_ka || col.title_en}</h2>
        {col.title_ka && col.title_en && (
          <p className={styles.cardSub}>{col.title_en}</p>
        )}
      </div>
    </Link>
  )
}

export default function Collections() {
  const { collections, loading } = useCollections()

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <span className={styles.kicker}>კატალოგი</span>
        <h1 className={styles.h1}>კოლექციები</h1>
        <p className={styles.sub}>
          ფილმები დაჯგუფებული თემების, ეპოქებისა და ჟანრების მიხედვით
        </p>
      </div>

      <div className={styles.grid}>
        {loading
          ? SKELETONS.map((_, i) => <div key={i} className={styles.cardSkeleton} />)
          : collections.map(col => (
              <CollectionCard key={col.slug} collection={col} />
            ))
        }
      </div>

    </div>
  )
}
