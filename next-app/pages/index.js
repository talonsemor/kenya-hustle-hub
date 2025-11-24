import Head from 'next/head'
import Layout from '../components/Layout'
import Card from '../components/Card'

const sampleItems = [
  {title: 'Online job: Remote VA', desc: 'Part-time remote virtual assistant roles for Kenyan applicants', tag: 'Local Biz'},
  {title: 'Scholarship: Global Opportunity', desc: 'Fully funded scholarship for STEM students', tag: 'Scholarships'},
  {title: 'Grant: Small Business', desc: 'Micro-grant for informal businesses', tag: 'Local Biz'},
]

export default function Home(){
  return (
    <Layout>
      <Head>
        <title>Kenya Hustle Hub — Next</title>
      </Head>

      <section className="hero">
        <h1>Find hustles, grants and opportunities — fast</h1>
        <p className="lead">A modern Next.js front-end demo with clean UI, cards, and theme support.</p>
      </section>

      <section className="grid-container">
        {sampleItems.map((it, i)=> (
          <Card key={i} title={it.title} tag={it.tag}>{it.desc}</Card>
        ))}
      </section>
    </Layout>
  )
}
