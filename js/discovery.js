// Discovery Widget - BBC News, Sports, Crypto feeds
// Adds proxy fallback and localStorage caching to avoid "Unable to load feed" errors
// Optimized with parallel feed loading for faster performance

const DISCOVERY_CONFIG = {
  feeds: [
    { id: 'news', name: 'BBC News', icon: '📰', urls: ['https://feeds.bbci.co.uk/news/rss.xml', 'https://feeds.bbci.co.uk/news/world/rss.xml'] },
    { id: 'sports', name: 'BBC Sport', icon: '⚽', urls: ['https://feeds.bbci.co.uk/sport/rss.xml', 'https://feeds.bbci.co.uk/sport/football/rss.xml'] },
    { id: 'crypto', name: 'Crypto News', icon: '₿', urls: ['https://cointelegraph.com/feed', 'https://www.coindesk.com/arc/outboundfeeds/rss/'] }
  ],
  proxies: [
    'https://api.allorigins.win/get?url=',
    'https://api.allorigins.cf/get?url=',
    'https://thingproxy.freeboard.io/fetch/'
  ],
  timeout: 10000,
  maxItems: 3,
  cacheTTLms: 1000 * 60 * 60 * 24 // 24 hours
};

function cacheKey(feedId) { return 'discovery_cache_' + feedId; }

function readCache(feedId){
  try{
    const raw = localStorage.getItem(cacheKey(feedId));
    if(!raw) return null;
    const obj = JSON.parse(raw);
    if(!obj.ts || !obj.items) return null;
    if(Date.now() - obj.ts > DISCOVERY_CONFIG.cacheTTLms) return null;
    return obj.items;
  }catch(e){ return null; }
}

function writeCache(feedId, items){
  try{ localStorage.setItem(cacheKey(feedId), JSON.stringify({ ts: Date.now(), items })); }catch(e){ /* ignore */ }
}

async function fetchWithProxy(url){
  for(const p of DISCOVERY_CONFIG.proxies){
    const proxyUrl = p + encodeURIComponent(url);
    try{
      const controller = new AbortController();
      const id = setTimeout(()=>controller.abort(), DISCOVERY_CONFIG.timeout);
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(id);
      if(!res.ok) throw new Error('proxy failed');
      // allorigins returns JSON {contents: '...'} while others may return raw text
      const ct = res.headers.get('content-type') || '';
      if(ct.includes('application/json')){
        const j = await res.json();
        if(j && j.contents) return j.contents;
      } else {
        const txt = await res.text();
        if(txt && txt.length>0) return txt;
      }
    }catch(e){
      // try next proxy
      console.warn('proxy fetch failed', p, e.message || e);
      continue;
    }
  }
  throw new Error('all proxies failed');
}

function parseFeedXml(xmlText){
  try{
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    if(doc.getElementsByTagName('parsererror').length) throw new Error('xml parse error');
    // RSS <item> or Atom <entry>
    const nodes = doc.querySelectorAll('item, entry');
    return Array.from(nodes).map(n=>{
      const title = (n.querySelector('title')?.textContent || '').trim();
      const link = (n.querySelector('link')?.textContent || n.querySelector('link[rel="alternate"]')?.getAttribute('href') || '').trim();
      const desc = (n.querySelector('description')?.textContent || n.querySelector('summary')?.textContent || n.querySelector('content')?.textContent || '').trim();
      const pub = (n.querySelector('pubDate')?.textContent || n.querySelector('updated')?.textContent || new Date().toISOString()).trim();
      const clean = desc.replace(/<[^>]*>?/gm,'').replace(/&[a-z]+;/g,'');
      return { title, link: link || '#', description: clean.slice(0,200), pubDate: pub };
    });
  }catch(e){
    console.warn('parseFeedXml error', e);
    return [];
  }
}

async function fetchDiscoveryFeed(feedUrl){
  try{
    const xml = await fetchWithProxy(feedUrl);
    const items = parseFeedXml(xml).slice(0, DISCOVERY_CONFIG.maxItems);
    return items;
  }catch(err){
    console.warn('fetchDiscoveryFeed failed for', feedUrl, err.message || err);
    return [];
  }
}

async function getFeedItemsWithCache(feedConfig){
  // Fetch URLs in parallel for faster loading
  const fetchPromises = feedConfig.urls.map(url => fetchDiscoveryFeed(url).catch(e => { console.warn('url fetch error', url, e); return []; }));
  const results = await Promise.race([Promise.all(fetchPromises), new Promise(resolve => setTimeout(() => resolve([]), DISCOVERY_CONFIG.timeout))]);
  let items = [];
  if(Array.isArray(results)){
    for(const result of results){
      if(result && result.length) items.push(...result);
      if(items.length >= DISCOVERY_CONFIG.maxItems) break;
    }
  }
  items = items.slice(0, DISCOVERY_CONFIG.maxItems);
  // if got results, cache and return
  if(items.length){ writeCache(feedConfig.id, items); return items; }
  // otherwise try cache
  const cached = readCache(feedConfig.id);
  if(cached && cached.length) return cached.slice(0, DISCOVERY_CONFIG.maxItems);
  return [];
}

async function initializeDiscovery(){
  const discoveryGrid = document.getElementById('discoveryGrid');
  if(!discoveryGrid) return;
  // Load all feeds in parallel for faster rendering
  const feedPromises = DISCOVERY_CONFIG.feeds.map(async (feedConfig) => {
    const contentEl = document.getElementById(`${feedConfig.id}Content`);
    if(!contentEl) return;
    contentEl.innerHTML = '';
    // show skeleton while loading
    for(let i=0;i<2;i++){ const s = document.createElement('div'); s.className='skeleton'; contentEl.appendChild(s); }
    const items = await getFeedItemsWithCache(feedConfig);
    contentEl.innerHTML = '';
    if(items.length){
      items.forEach(it=>{
        const itemEl = document.createElement('div'); itemEl.className='discovery-item';
        const pubDate = new Date(it.pubDate);
        const timeString = isNaN(pubDate.getTime()) ? '' : pubDate.toLocaleDateString();
        itemEl.innerHTML = `<a href="${it.link}" target="_blank" rel="noopener noreferrer">${it.title.length>80?it.title.slice(0,80)+'...':it.title}</a><div class="item-date">${timeString}</div>`;
        contentEl.appendChild(itemEl);
      });
    } else {
      // Try to show cached items if available
      const cached = readCache(feedConfig.id);
      if(cached && cached.length){
        cached.slice(0, DISCOVERY_CONFIG.maxItems).forEach(it=>{
          const itemEl = document.createElement('div'); itemEl.className='discovery-item';
          const pubDate = new Date(it.pubDate);
          const timeString = isNaN(pubDate.getTime()) ? '' : pubDate.toLocaleDateString();
          itemEl.innerHTML = `<a href="${it.link}" target="_blank" rel="noopener noreferrer">${it.title.length>80?it.title.slice(0,80)+'...':it.title}</a><div class="item-date">${timeString}</div>`;
          contentEl.appendChild(itemEl);
        });
      } else {
        contentEl.innerHTML = `<div class="discovery-error">No recent feeds available.</div>`;
      }
    }
  });
  await Promise.all(feedPromises);
}

document.addEventListener('DOMContentLoaded', ()=>{
  initializeDiscovery();
  // Insert discovery box after the 2nd item in the feed (Canada Life card)
  // Use MutationObserver to reliably detect when feed items are rendered
  (function moveAfterSecondItem(){
    const discoveryWrapper = document.querySelector('.discovery-wrapper');
    const containerSelector = '.items.grid-small';
    const moveIfReady = () => {
      const container = document.querySelector(containerSelector);
      if(!container || !discoveryWrapper) return false;
      const items = container.querySelectorAll('.item');
      if(items && items.length >= 2){
        // Insert discovery wrapper after the 2nd item
        const target = items[1].nextSibling;
        if(discoveryWrapper !== target){
          items[1].parentNode.insertBefore(discoveryWrapper, target);
        }
        return true;
      }
      return false;
    };

    if(!moveIfReady()){
      const observerTarget = document.querySelector(containerSelector) || document.body;
      const obs = new MutationObserver((mutations, observer)=>{
        if(moveIfReady()) observer.disconnect();
      });
      obs.observe(observerTarget, { childList: true, subtree: true });
      // safety timeout: stop observing after 8s
      setTimeout(()=>{ try{ obs.disconnect(); }catch(e){} }, 8000);
    }
  })();
    setInterval(initializeDiscovery, 15 * 60 * 1000);

    // ===== Highlight card: try RSS images then fallback to local assets =====
    const HIGHLIGHT_FEEDS = [
      'https://feeds.bbci.co.uk/sport/rss.xml',
      'https://feeds.bbci.co.uk/news/rss.xml',
      'https://www.coindesk.com/arc/outboundfeeds/rss/'
    ];

    async function fetchImageItemsFromFeed(feedUrl, max=5){
      try{
        const xml = await fetchWithProxy(feedUrl);
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');
        const nodes = doc.querySelectorAll('item, entry');
        const out = [];
        for(let i=0;i<nodes.length && out.length<max;i++){
          const n = nodes[i];
          const title = (n.querySelector('title')?.textContent || '').trim();
          const link = (n.querySelector('link')?.textContent || n.querySelector('link[rel="alternate"]')?.getAttribute('href') || '').trim();
          const rawDesc = (n.querySelector('description')?.textContent || n.querySelector('summary')?.textContent || n.querySelector('content')?.textContent || '').trim();
          let img = '';
          const enc = n.querySelector('enclosure');
          if(enc && enc.getAttribute) img = enc.getAttribute('url') || '';
          if(!img){
            const mc = n.querySelector('media\:content, media\\:thumbnail');
            if(mc && mc.getAttribute) img = mc.getAttribute('url') || mc.getAttribute('medium') || '';
          }
          if(!img){
            const m = rawDesc.match(/<img[^>]+src=["']?([^"'>\s]+)/i);
            if(m) img = m[1];
          }
          if(img) out.push({ title, link, img, desc: rawDesc.replace(/<[^>]*>?/gm,'').slice(0,200) });
        }
        return out;
      }catch(e){
        console.warn('fetchImageItemsFromFeed failed', feedUrl, e && e.message);
        return [];
      }
    }

    async function buildHighlightItems(){
      const results = [];
      try{
        const promises = HIGHLIGHT_FEEDS.map(u => fetchImageItemsFromFeed(u).catch(()=>[]));
        const arrs = await Promise.all(promises);
        for(const a of arrs){
          for(const it of a){
            if(!it.img) continue;
            if(results.find(r=>r.img===it.img)) continue;
            results.push(it);
            if(results.length>=8) break;
          }
          if(results.length>=8) break;
        }
      }catch(e){ console.warn('buildHighlightItems error', e); }

      // Local fallback assets (guaranteed to exist in repo)
      const local = [
        { title: 'Premier League Highlights', img: 'assets/images/discovery-premier-league.svg', desc: 'Catch up on the latest football action from the English Premier League.' },
        { title: 'Oscars 2025 Winners', img: 'assets/images/discovery-oscars.svg', desc: 'See who took home the biggest awards in entertainment this year.' },
        { title: 'Street Food Festival', img: 'assets/images/discovery-street-food.svg', desc: 'Explore the best street food from around the world, now trending.' },
        { title: 'Hiking Trails Kenya', img: 'assets/images/discovery-hiking.svg', desc: 'Discover scenic hiking routes for all skill levels in Kenya.' },
        { title: 'NBA Playoffs Update', img: 'assets/images/discovery-nba.svg', desc: 'Latest scores and highlights from the NBA playoffs.' },
        { title: 'Music Festival Lineup', img: 'assets/images/discovery-music.svg', desc: 'Check out the artists performing at this year\'s biggest music festivals.' },
        { title: 'Vegan Food Trends', img: 'assets/images/discovery-vegan.svg', desc: 'What\'s new and popular in the world of vegan cuisine?' },
        { title: 'Mount Kenya Adventure', img: 'assets/images/discovery-kenya.svg', desc: 'Plan your next adventure to Mount Kenya with these tips.' }
      ];

      if(results.length < 8){
        for(const l of local){
          if(results.length>=8) break;
          if(!results.find(r=>r.img===l.img)) results.push(l);
        }
      }
      return results.slice(0,8);
    }

    // Build and rotate highlight card
    (async function(){
      try{
        const items = await buildHighlightItems();
        if(!items || !items.length) return;
        const iconEl = document.getElementById('highlightIcon');
        const titleEl = document.getElementById('highlightTitle');
        const imgEl = document.getElementById('highlightImg');
        const descEl = document.getElementById('highlightDesc');
        let idx = 0;
        function show(i){
          const d = items[i];
          if(!d) return;
          if(iconEl) iconEl.textContent = d.icon || (d.title && d.title[0]) || '•';
          if(titleEl) titleEl.textContent = d.title || '';
          if(imgEl) { imgEl.src = d.img; imgEl.alt = d.title || 'image'; }
          if(descEl) descEl.textContent = d.desc || '';
        }
        show(0);
        setInterval(()=>{ idx = (idx+1) % items.length; show(idx); }, 4000);
      }catch(e){ console.warn('highlight rotator init failed', e); }
    })();
  });

