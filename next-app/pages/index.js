import Head from 'next/head'
import Layout from '../components/Layout'
import Card from '../components/Card'

const sampleItems = [
  {title: 'Premier League Highlights', desc: 'Catch up on the latest football action from the English Premier League.', tag: 'Sports', img: '/images/premier-league.svg'},
  {title: 'Oscars 2025 Winners', desc: 'See who took home the biggest awards in entertainment this year.', tag: 'Entertainment', img: '/images/oscars.svg'},
  {title: 'Street Food Festival', desc: 'Explore the best street food from around the world, now trending.', tag: 'Food', img: '/images/street-food.svg'},
  {title: 'Hiking Trails Kenya', desc: 'Discover scenic hiking routes for all skill levels in Kenya.', tag: 'Hiking', img: '/images/hiking-trails.svg'},
  {title: 'NBA Playoffs Update', desc: 'Latest scores and highlights from the NBA playoffs.', tag: 'Sports', img: '/images/nba-playoffs.svg'},
  {title: 'Music Festival Lineup', desc: 'Check out the artists performing at this year\'s biggest music festivals.', tag: 'Entertainment', img: '/images/music-festival.svg'},
  {title: 'Vegan Food Trends', desc: 'What\'s new and popular in the world of vegan cuisine?', tag: 'Food', img: '/images/vegan-food.svg'},
  {title: 'Mount Kenya Adventure', desc: 'Plan your next adventure to Mount Kenya with these tips.', tag: 'Hiking', img: '/images/mount-kenya.svg'}
]

export default function Home(){
  return (
    <Layout>
      <Head>
        <title>Kenya Hustle Hub â€” Next</title>
      </Head>

      <section className="hero">
        <h1>Find hustles, grants and opportunities â€” fast</h1>
        <p className="lead">A modern Next.js front-end demo with clean UI, cards, and theme support.</p>
      </section>

      <section className="grid-container">
        {sampleItems.map((it, i) => (
          <Card key={i} title={it.title} tag={it.tag} img={it.img}>{it.desc}</Card>
        ))}
      </section>
    </Layout>
  )
}
