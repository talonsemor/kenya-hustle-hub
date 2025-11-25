// Discovery Widget - BBC News, Sports, Crypto feeds
// Adds proxy fallback and localStorage caching to avoid "Unable to load feed" errors

const DISCOVERY_CONFIG = {
  feeds: [
    { id: 'news', name: 'BBC News', icon: '📰', urls: ['https://feeds.bbci.co.uk/news/rss.xml', 'https://feeds.bbci.co.uk/news/world/rss.xml'] },
    { id: 'sports', name: 'BBC Sport', icon: '⚽', urls: ['https://feeds.bbci.co.uk/sport/rss.xml', 'https://feeds.bbci.co.uk/sport/football/rss.xml'] },
    { id: 'crypto', name: 'Crypto News', icon: '₿', urls: ['https://cointelegraph.com/feed', 'https://www.coindesk.com/arc/outboundfeeds/rss/'] }
  ],
  // ordered list of proxies to try (public proxies)
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
  // try fresh fetch across configured feed urls
  let items = [];
  for(const url of feedConfig.urls){
    try{
      const got = await fetchDiscoveryFeed(url);
      if(got && got.length) items.push(...got);
      if(items.length >= DISCOVERY_CONFIG.maxItems) break;
    }catch(e){ console.warn('url fetch error', url, e); }
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
  for(const feedConfig of DISCOVERY_CONFIG.feeds){
    const contentEl = document.getElementById(`${feedConfig.id}Content`);
    if(!contentEl) continue;
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
        contentEl.innerHTML = `<div class=\"discovery-error\">No recent feeds available.</div>`;
      }
    }
  }
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
});
