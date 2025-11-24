import Head from 'next/head'
import Layout from '../components/Layout'

export default function About() {
  return (
    <Layout>
      <Head>
        <title>About | Kenya Hustle Hub</title>
      </Head>
      <section className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-4 text-blue-600 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z" /></svg>
          About Kenya Hustle Hub
        </h1>
        <p className="mb-6 text-lg text-gray-200">Kenya Hustle Hub is your trusted source for real, up-to-date opportunities: jobs, scholarships, grants, and more. We empower Kenyans to discover, apply, and thrive in the digital economy.</p>
        <div className="mb-8 bg-blue-50/10 rounded-xl p-6 border border-blue-200/10 shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-blue-400 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2M12 12v4m0 0l-2-2m2 2l2-2m-2-2V4m0 0l-2 2m2-2l2 2" /></svg>
            Contact Us
          </h2>
          <ul className="space-y-2 text-base">
            <li className="flex items-center gap-2">
              <a href="https://wa.me/254740582544" target="_blank" rel="noopener" aria-label="Open WhatsApp chat" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.8 11.8 0 0012 .5 11.74 11.74 0 00.5 12c0 2.07.54 4.02 1.56 5.76L.5 23.5l5.98-1.58A11.74 11.74 0 0012 23.5c6.36 0 11.5-5.14 11.5-11.5 0-3.08-1.2-5.98-3.48-8.52zM17.12 14.03c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.15.24-.6.78-.73.94-.13.15-.26.18-.5.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.02-.37.11-.5.11-.12.24-.26.36-.39.12-.13.16-.22.24-.37.08-.15.04-.28-.02-.39-.06-.12-.54-1.3-.74-1.79-.19-.47-.39-.41-.54-.42-.14-.01-.31-.01-.48-.01-.16 0-.42.06-.64.3-.22.24-.86.84-.86 2.06 0 1.22.88 2.4 1.01 2.56.12.15 1.75 2.66 4.24 3.72 2.49 1.06 2.49.71 2.92.66.43-.05 1.38-.56 1.58-1.11.2-.55.2-1.02.14-1.11-.06-.09-.22-.15-.46-.27z"/></svg>
                <span className="text-blue-400 hover:underline">+254 740 582 544</span>
              </a>
            </li>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16zM4 20V8.99l7.99 7.99c.39.39 1.02.39 1.41 0L20 8.99V20H4z"/></svg>
              <span>Email: <a href="mailto:kenyahustlehub@gmail.com" className="text-blue-400 hover:underline">kenyahustlehub@gmail.com</a></span>
            </li>
          </ul>
        </div>
        <div className="prose prose-invert max-w-none bg-white/5 rounded-xl p-6 border border-gray-700/30 shadow-xl">
          <h2 className="text-2xl font-bold text-blue-500 mb-2">Our Inspiration</h2>
          <p className="text-lg">We believe in the power of digital transformation to uplift communities. Kenya Hustle Hub was founded by professionals passionate about technology, education, and economic empowerment. Our mission is to connect Kenyans with real opportunities, foster innovation, and inspire the next generation of digital entrepreneurs.</p>
          <ul className="mt-4 space-y-1 text-base">
            <li>• 100% free, open, and accessible</li>
            <li>• Curated by real people, not bots</li>
            <li>• Built for high-traffic, mobile-first audiences</li>
            <li>• Inspired by the hustle and resilience of Kenyans everywhere</li>
          </ul>
        </div>
      </section>
    </Layout>
  )
}
