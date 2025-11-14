
const CONFIG = {
  feeds: [
    {url: 'https://www.mygov.go.ke/feed/', source: 'MyGov Kenya', category: 'Government'},
    {url: 'https://tenderskenya.co.ke/feed/', source: 'TendersKenya', category: 'Tenders'},
    {url: 'https://www.biznakenya.com/feed/', source: 'BiznaKenya', category: 'Local Biz'},
    {url: 'https://www.opportunitydesk.org/feed/', source: 'OpportunityDesk', category: 'Scholarships'}
  ],
  rss2json: 'https://api.rss2json.com/v1/api.json?rss_url=',
  pageSize: 8,
};

let ALL = [];
let index = 0;
const itemsEl = document.getElementById('items');
const sourcesEl = document.getElementById('sources');
const sourceFilter = document.getElementById('sourceFilter');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');
const loadMoreBtn = document.getElementById('loadMore');
const refreshBtn = document.getElementById('refreshBtn');
const menuBtn = document.getElementById('menuBtn');
const sideNav = document.getElementById('sideNav');
const themeToggle = document.getElementById('themeToggle');
const mpesaNum = document.getElementById('mpesaNum');
const categoryTabs = document.getElementById('categoryTabs');
const quickTags = document.getElementById('quickTags');
const loader = document.getElementById('loader');

function el(q){return document.querySelector(q);}
function showLoader(v){ loader.style.display = v ? 'flex' : 'none'; }

// MENU
menuBtn.addEventListener('click', ()=>{ const open = sideNav.classList.toggle('open'); menuBtn.classList.toggle('open', open); document.body.style.overflow = open ? 'hidden' : ''; });

// THEME
themeToggle && themeToggle.addEventListener('click', ()=>{ document.body.classList.toggle('light'); document.body.classList.toggle('dark'); });

// populate UI
function initUI(){
  // categories tabs
  const cats = ['all', ...new Set(CONFIG.feeds.map(f=>f.category))];
  cats.forEach(c=>{
    const b = document.createElement('button'); b.className='tag'; b.textContent = c=='all' ? 'All' : c; b.dataset.cat = c; b.onclick = ()=> { filterByCategory(c); };
    categoryTabs.appendChild(b);
  });
  // sources list
  sourceFilter.innerHTML = '<option value="all">All sources</option>';
  CONFIG.feeds.forEach(f=> sourceFilter.appendChild(Object.assign(document.createElement('option'),{value:f.source,textContent:f.source})));
  // quick tags
  ['Online Jobs','Scholarships','Tenders','Local Biz','Training'].forEach(t=>{ const el = document.createElement('button'); el.className='tag'; el.textContent=t; el.onclick = ()=> filterByCategory(t); quickTags.appendChild(el); });
}

// fetch feed via rss2json
async function fetchFeed(url){ try{ const r = await fetch(CONFIG.rss2json + encodeURIComponent(url)); if(!r.ok) throw new Error('fetch failed'); const j = await r.json(); return j.items || []; }catch(e){ console.warn('feed error', url, e); return []; } }

// load all feeds
async function loadAll(){
  showLoader(true);
  const promises = CONFIG.feeds.map(async f=>{ const items = await fetchFeed(f.url); return items.map(it=>({ title: it.title||'Untitled', link: it.link||'#', description: (it.description||it.contentSnippet||'').replace(/<[^>]*>?/gm,''), pubDate: it.pubDate||it.isoDate||'', source: f.source, category: f.category })); });
  const results = await Promise.all(promises);
  ALL = results.flat().sort((a,b)=> new Date(b.pubDate)-new Date(a.pubDate));
  index = 0; render(); renderSources(); renderDashboard();
  showLoader(false);
}

// render items
function render(){
  const q = (searchInput.value||'').toLowerCase();
  const src = (sourceFilter.value||'all');
  const filtered = ALL.filter(it=> { if(src!=='all' && it.source!==src) return false; if(q && !(it.title+it.description+it.source+it.category).toLowerCase().includes(q)) return false; return true; });
  itemsEl.innerHTML='';
  const slice = filtered.slice(0, index+CONFIG.pageSize);
  slice.forEach(it=>{ const d = document.createElement('article'); d.className='item card'; d.innerHTML = `<h3><a href="${it.link}" target="_blank" rel="noopener">${it.title}</a></h3><div class="meta">${new Date(it.pubDate).toLocaleDateString()} • ${it.source} • ${it.category}</div><p>${it.description.slice(0,240)}${it.description.length>240?'...':''}</p><div style="margin-top:8px;display:flex;gap:10px"><a class="btn ghost" href="${it.link}" target="_blank">Open</a></div>`; itemsEl.appendChild(d); });
  index = slice.length;
  loadMoreBtn.style.display = filtered.length>index ? 'inline-block' : 'none';
}

// render sources
function renderSources(){ sourcesEl.innerHTML=''; CONFIG.feeds.forEach(f=>{ const el = document.createElement('div'); el.className='src'; el.innerHTML = `<strong>${f.source}</strong><div class="small">${f.category}</div>`; sourcesEl.appendChild(el); }); }

// filters
function filterByCategory(cat){ if(cat==='all'){ index=0; render(); return; } const filtered = ALL.filter(it=> (it.category||'').toLowerCase() === cat.toLowerCase() ); itemsEl.innerHTML=''; filtered.slice(0,CONFIG.pageSize).forEach(it=>{ const d = document.createElement('article'); d.className='item card'; d.innerHTML = `<h3><a href="${it.link}" target="_blank" rel="noopener">${it.title}</a></h3><div class='meta'>${new Date(it.pubDate).toLocaleDateString()} • ${it.source}</div><p>${it.description.slice(0,240)}</p>`; itemsEl.appendChild(d); }); index = Math.min(filtered.length, CONFIG.pageSize); }

// dashboard render
function renderDashboard(){
  // update stats if dashboard exists
  const total = ALL.length;
  const sources = new Set(ALL.map(i=>i.source)).size;
  const categories = new Set(ALL.map(i=>i.category)).size;
  const last = ALL.length ? new Date(ALL[0].pubDate).toLocaleString() : '—';
  const elTotal = document.getElementById('totalItems'); if(elTotal) elTotal.textContent = total;
  const elSources = document.getElementById('bySource'); if(elSources) elSources.textContent = sources;
  const elCats = document.getElementById('byCategory'); if(elCats) elCats.textContent = categories;
  const elLast = document.getElementById('lastUpdated'); if(elLast) elLast.textContent = last;
  const topSources = document.getElementById('topSources'); if(topSources){
    const counts = {}; ALL.forEach(i=> counts[i.source] = (counts[i.source]||0)+1);
    topSources.innerHTML = Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([s,c])=>`<li>${s} — ${c}</li>`).join('');
  }
}

// UI events
searchBtn.addEventListener('click', ()=>{ index=0; render(); });
refreshBtn.addEventListener('click', ()=> loadAll());
sourceFilter.addEventListener('change', ()=>{ index=0; render(); });

document.getElementById('exploreBtn')?.addEventListener('click', ()=> document.querySelector('#listings').scrollIntoView({behavior:'smooth'}));

window.addEventListener('click', (e)=>{ if(sideNav.classList.contains('open')){ const inside = sideNav.contains(e.target) || menuBtn.contains(e.target); if(!inside){ sideNav.classList.remove('open'); menuBtn.classList.remove('open'); document.body.style.overflow = ''; } } });

// init
initUI();
loadAll();
