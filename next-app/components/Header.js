export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 border-b border-slate-800 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z" /></svg>
          <a className="font-bold text-lg text-white tracking-tight" href="/">Kenya Hustle Hub</a>
        </div>
        <nav className="flex gap-2">
          <a href="/" className="px-3 py-1 rounded hover:bg-blue-900/40 text-blue-300 font-medium transition">Home</a>
          <a href="/about" className="px-3 py-1 rounded hover:bg-blue-900/40 text-blue-300 font-medium transition">About</a>
        </nav>
      </div>
    </header>
  )
}
