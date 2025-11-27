export default function Card({ title, children, tag, img }) {
  return (
    <article className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl hover:shadow-2xl transition p-6 flex flex-col gap-3">
      {img && (
        <img src={img} alt={title} className="rounded-xl w-full h-40 object-cover mb-3" loading="lazy" />
      )}
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="font-semibold text-lg text-blue-200 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {title}
        </h3>
        <span className="px-3 py-1 rounded-full bg-blue-800/40 text-blue-300 text-xs font-medium">{tag}</span>
      </div>
      <p className="text-slate-300 text-base flex-1">{children}</p>
      <div className="flex justify-end">
        <button className="btn small flex items-center gap-1 bg-blue-700/30 hover:bg-blue-700/60 text-blue-200 px-4 py-2 rounded-lg transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2M12 12v4m0 0l-2-2m2 2l2-2m-2-2V4m0 0l-2 2m2-2l2 2" /></svg>
          Open
        </button>
      </div>
    </article>
  )
}
