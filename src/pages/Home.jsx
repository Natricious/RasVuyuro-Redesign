import HomeNav   from './home/HomeNav'
import HomeHero  from './home/HomeHero'
import HomeRails from './home/HomeRails'
import styles    from './home/home.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <HomeNav />
      <HomeHero />
      <HomeRails />
    </div>
  )
}
