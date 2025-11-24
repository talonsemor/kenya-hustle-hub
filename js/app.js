
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
if(menuBtn && sideNav){
  menuBtn.addEventListener('click', ()=>{ const open = sideNav.classList.toggle('open'); menuBtn.classList.toggle('open', open); document.body.style.overflow = open ? 'hidden' : ''; });
}

// THEME
// THEME
function applyTheme(theme){
  if(!theme) return;
  document.body.classList.toggle('light', theme === 'light');
  document.body.classList.toggle('dark', theme === 'dark');
}

// apply saved theme (if any) or respect prefers-color-scheme
try{
  const savedTheme = localStorage.getItem('theme');
  if(savedTheme){
    applyTheme(savedTheme);
  } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
    applyTheme('dark');
  }
}catch(e){ console.warn('Could not read theme from localStorage', e); }

// set ARIA state for the theme toggle control
function updateToggleAria(){
  if(!themeToggle) return;
  const isLight = document.body.classList.contains('light');
  themeToggle.setAttribute('aria-checked', isLight ? 'true' : 'false');
}

// initialize toggle aria & keyboard support
try{
  updateToggleAria();
  if(themeToggle){
    // keyboard: space or enter toggles
    themeToggle.addEventListener('keydown', (e)=>{
      if(e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter'){
        e.preventDefault();
        themeToggle.click();
      }
    });

    themeToggle.addEventListener('click', ()=>{
      const isLight = document.body.classList.toggle('light');
      document.body.classList.toggle('dark', !isLight);
      const current = isLight ? 'light' : 'dark';
      try{ localStorage.setItem('theme', current); }catch(e){ console.warn('Could not save theme', e); }
      // update aria state
      themeToggle.setAttribute('aria-checked', isLight ? 'true' : 'false');
    });
  }
}catch(e){ console.warn('Theme toggle init error', e); }

// populate UI
function initUI(){
  // categories tabs: show only allowed categories to simplify UI
  const ALLOWED_CATEGORIES = ['Local Biz', 'Scholarships'];
  const cats = ['all', ...ALLOWED_CATEGORIES];
  cats.forEach(c=>{
    const b = document.createElement('button'); b.className='tag'; b.textContent = c=='all' ? 'All' : c; b.dataset.cat = c; b.onclick = ()=> {
      // set active state on tabs
      Array.from(categoryTabs.querySelectorAll('.tag')).forEach(el=>el.classList.remove('active'));
      b.classList.add('active');
      filterByCategory(c);
    };
    categoryTabs.appendChild(b);
  });
  // sources list - include only feeds that match allowed categories
  sourceFilter.innerHTML = '<option value="all">All sources</option>';
  CONFIG.feeds.filter(f => ALLOWED_CATEGORIES.includes(f.category)).forEach(f=> sourceFilter.appendChild(Object.assign(document.createElement('option'),{value:f.source,textContent:f.source})));
  // quick tags
  // quick tags - keep limited set (Local Biz, Scholarships)
  ['Local Biz','Scholarships'].forEach(t=>{
    const el = document.createElement('button'); el.className='tag'; el.textContent=t;
    el.onclick = ()=>{
      // mark as active and clear category tabs active
      Array.from(quickTags.querySelectorAll('.tag')).forEach(x=>x.classList.remove('active'));
      el.classList.add('active');
      Array.from(categoryTabs.querySelectorAll('.tag')).forEach(x=>x.classList.remove('active'));
      filterByCategory(t);
    };
    quickTags.appendChild(el);
  });
}

// fetch feed via rss2json
async function fetchFeed(url){ try{ const r = await fetch(CONFIG.rss2json + encodeURIComponent(url)); if(!r.ok) throw new Error('fetch failed'); const j = await r.json(); return j.items || []; }catch(e){ console.warn('feed error', url, e); return []; } }

// load all feeds
async function loadAll(){
  showLoader(true);
  const promises = CONFIG.feeds.map(async f=>{ const items = await fetchFeed(f.url); return items.map(it=>({ title: it.title||'Untitled', link: it.link||'#', description: (it.description||it.contentSnippet||'').replace(/<[^>]*>?/gm,''), pubDate: it.pubDate||it.isoDate||'', source: f.source, category: f.category })); });
  const results = await Promise.all(promises);
  ALL = results.flat().sort((a,b)=> new Date(b.pubDate)-new Date(a.pubDate));
  index = 0; render(); renderSources();
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
function normalizeCat(s){ return (s||'').toString().trim().toLowerCase(); }

function filterByCategory(cat){
  if(!cat || normalizeCat(cat) === 'all'){ index=0; render(); return; }
  const wanted = normalizeCat(cat);
  const filtered = ALL.filter(it=> normalizeCat(it.category) === wanted );
  itemsEl.innerHTML='';
  filtered.slice(0,CONFIG.pageSize).forEach(it=>{ const d = document.createElement('article'); d.className='item card'; d.innerHTML = `<h3><a href="${it.link}" target="_blank" rel="noopener">${it.title}</a></h3><div class='meta'>${new Date(it.pubDate).toLocaleDateString()} • ${it.source}</div><p>${it.description.slice(0,240)}</p>`; itemsEl.appendChild(d); });
  index = Math.min(filtered.length, CONFIG.pageSize);
  // if no items found for this category, show a small message
  if(filtered.length === 0){
    const note = document.createElement('div'); note.className='card small'; note.style.marginTop='12px'; note.textContent = `No items found for "${cat}".`;
    itemsEl.appendChild(note);
  }
}

// dashboard logic removed (dashboard.html deleted)


// UI events
if(searchBtn) searchBtn.addEventListener('click', ()=>{ index=0; render(); });
if(refreshBtn) refreshBtn.addEventListener('click', ()=> loadAll());
if(sourceFilter) sourceFilter.addEventListener('change', ()=>{ index=0; render(); });

document.getElementById('exploreBtn')?.addEventListener('click', ()=> document.querySelector('#listings').scrollIntoView({behavior:'smooth'}));

window.addEventListener('click', (e)=>{
  if(sideNav && sideNav.classList.contains('open')){
    const inside = (sideNav.contains(e.target)) || (menuBtn && menuBtn.contains(e.target));
    if(!inside){ sideNav.classList.remove('open'); menuBtn && menuBtn.classList.remove('open'); document.body.style.overflow = ''; }
  }
});


// init
initUI();
loadAll();

// auto-refresh every 5 minutes
const AUTO_REFRESH_MS = 5 * 60 * 1000;
setInterval(() => { loadAll(); }, AUTO_REFRESH_MS);

// Weather widget auto-refresh (moved from index.html)
(function(){
  const BOX_SEL = '.weather-box';
  const ANCHOR_SEL = '.weatherwidget-io';
  function buildAnchorHTML(href, label1, label2, theme){
    return `<a class="weatherwidget-io" href="${href}" data-label_1="${label1}" data-label_2="${label2}" data-theme="${theme}">${label1} ${label2}</a>`;
  }
  function loadWidgetScript(){
    const existing = document.getElementById('weatherwidget-io-js');
    if(existing) existing.remove();
    const js = document.createElement('script');
    js.id = 'weatherwidget-io-js';
    // cache-bust to force fresh network request
    js.src = 'https://weatherwidget.io/js/widget.min.js?v=' + Date.now();
    document.body.appendChild(js);
  }
  function refreshWidget(){
    const box = document.querySelector(BOX_SEL);
    if(!box) return;
    const href = box.getAttribute('data-w-href');
    const label1 = box.getAttribute('data-w-label1') || '';
    const label2 = box.getAttribute('data-w-label2') || '';
    const theme = box.getAttribute('data-w-theme') || 'original';
    // remove any rendered widget or existing anchor
    const existingAnchor = box.querySelector(ANCHOR_SEL);
    if(existingAnchor) existingAnchor.remove();
    // insert fresh anchor
    box.insertAdjacentHTML('beforeend', buildAnchorHTML(href, label1, label2, theme));
    // reload script to process the anchor
    loadWidgetScript();
  }
  // Refresh interval (ms) - 10 minutes
  const INTERVAL = 10 * 60 * 1000;
  // schedule periodic refresh
  setInterval(refreshWidget, INTERVAL);
  // also attempt one refresh shortly after load to ensure widget initializes
  setTimeout(refreshWidget, 1500);
})();
