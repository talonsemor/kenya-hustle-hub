import { useState, useEffect } from 'react'

export default function ModelToggle() {
  const STORAGE_KEY = 'site_model'
  const [model, setModel] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'default' } catch { return 'default' }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, model) } catch (e) {}
  }, [model])

  return (
    <div style={{maxWidth:560,margin:'24px auto',padding:16,borderRadius:10,background:'#fff',boxShadow:'0 6px 18px rgba(10,20,40,0.04)'}}>
      <h2 style={{margin:'0 0 8px 0'}}>Model feature flag</h2>
      <p style={{margin:'0 0 12px 0',color:'#475569'}}>Choose which model the site should use for new sessions (client-side only).</p>
      <div style={{display:'flex',gap:8}}>
        <button onClick={() => setModel('default')} style={{flex:1,padding:10}}>Default</button>
        <button onClick={() => setModel('claude-haiku-4.5')} style={{flex:1,padding:10,background:'#0b5fff',color:'#fff',border:'none'}}>Claude Haiku 4.5</button>
      </div>
      <p style={{marginTop:12,fontSize:13,color:'#64748b'}}>Current: <strong>{model}</strong></p>
    </div>
  )
}
