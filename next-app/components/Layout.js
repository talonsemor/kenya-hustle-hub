
import Header from './Header'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-slate-100">
      <Header />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="py-8 text-center text-slate-400 border-t border-slate-800 bg-slate-950/80">
        <div className="text-sm">© 2025 Kenya Hustle Hub — Demo</div>
      </footer>
    </div>
  )
}
