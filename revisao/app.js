(() => {
  'use strict';
  const config = window.GROWTHOS_CONFIG || {};
  const price = Number.isFinite(config.price) && config.price > 0 ? config.price : 47;
  const money = new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL',maximumFractionDigits:Number.isInteger(price)?0:2}).format(price);
  document.querySelectorAll('.price').forEach(el => { el.textContent = money; });
  document.querySelectorAll('[data-price-number]').forEach(el => { el.textContent = price.toLocaleString('pt-BR'); });
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key,value) => { try { localStorage.setItem(key,value); } catch {} };
  let preference = read('growthos_marketing');
  let pixelStarted = false;
  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open','');
  }
  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeDialog(dialog);
  }));
  document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
    const caption = button.dataset.caption || 'Trabalho do portfólio Feediz';
    const image = document.getElementById('large-image');
    image.src = button.dataset.image;
    image.alt = caption;
    document.getElementById('image-caption').textContent = caption;
    openDialog(document.getElementById('image-dialog'));
  }));
  document.getElementById('privacy-open')?.addEventListener('click', () => openDialog(document.getElementById('privacy-dialog')));
  try {
    const canonical = new URL(config.canonicalUrl);
    if (canonical.protocol === 'https:') {
      const link = document.createElement('link'); link.rel = 'canonical'; link.href = canonical.href; document.head.append(link);
      const og = document.createElement('meta'); og.setAttribute('property','og:url'); og.content = canonical.href; document.head.append(og);
      const photo = document.querySelector('meta[property="og:image"]');
      if (photo) photo.content = new URL('assets/douglas.webp',canonical).href;
    }
  } catch {}
  function startPixel() {
    if (pixelStarted || preference !== 'yes' || config.trackingEnabled !== true || !/^\d+$/.test(String(config.metaPixelId || '')) || location.protocol === 'file:') return;
    pixelStarted = true;
    if (!window.fbq) {
      const fbq = function(){ fbq.callMethod ? fbq.callMethod.apply(fbq,arguments) : fbq.queue.push(arguments); };
      fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
      window.fbq = fbq; window._fbq = window._fbq || fbq;
      const script = document.createElement('script'); script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js'; document.head.append(script);
    }
    window.fbq('consent','grant');
    window.fbq('init',String(config.metaPixelId));
    window.fbq('track','PageView');
    window.fbq('track','ViewContent',{content_name:'GrowthOS — Marketing que Vende',content_type:'product',value:price,currency:'BRL'});
  }
  const cookieBar = document.getElementById('cookie-bar');
  if (cookieBar && config.trackingEnabled === true && !['yes','no'].includes(preference)) cookieBar.hidden = false;
  let toastTimer;
  document.querySelectorAll('[data-consent]').forEach(button => button.addEventListener('click', () => {
    preference = button.dataset.consent === 'yes' ? 'yes' : 'no';
    save('growthos_marketing',preference);
    if (cookieBar) cookieBar.hidden = true;
    closeDialog(document.getElementById('privacy-dialog'));
    if (preference === 'yes') {
      if (pixelStarted && window.fbq) window.fbq('consent','grant');
      startPixel();
    } else if (pixelStarted && window.fbq) window.fbq('consent','revoke');
    const toast = document.getElementById('toast');
    if (toast) { clearTimeout(toastTimer); toast.textContent = 'Sua preferência foi salva.'; toast.hidden = false; toastTimer = setTimeout(() => {toast.hidden = true;},3200); }
  }));
  startPixel();
  function buildCheckoutUrl(raw, search) {
    try {
      const url = new URL(raw);
      if (url.protocol !== 'https:' || url.hostname !== 'pay.kiwify.com.br' || url.username || url.password || url.port || url.pathname === '/') return null;
      const params = new URLSearchParams(search);
      ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','src','sck','fbclid'].forEach(key => {
        const value = params.get(key);
        if (value && value.length <= 500) url.searchParams.set(key,value);
      });
      return url.href;
    } catch { return null; }
  }
  document.querySelectorAll('[data-buy]').forEach(button => button.addEventListener('click', () => {
    const checkout = buildCheckoutUrl(config.checkoutUrl,location.search);
    if (config.checkoutReady !== true || !checkout) { openDialog(document.getElementById('availability-dialog')); return; }
    if (pixelStarted && preference === 'yes' && window.fbq) window.fbq('trackCustom','CheckoutClick',{content_name:'GrowthOS — Marketing que Vende',value:price,currency:'BRL'});
    window.location.assign(checkout);
  }));
  const sticky = document.getElementById('mobile-sticky');
  const hero = document.getElementById('hero-copy');
  const offer = document.getElementById('offer-card');
  if (sticky && hero && offer && 'IntersectionObserver' in window) {
    let heroVisible = true;
    let offerVisible = false;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.target === hero) heroVisible = entry.isIntersecting; if (entry.target === offer) offerVisible = entry.isIntersecting; });
      sticky.hidden = heroVisible || offerVisible;
    },{threshold:0});
    observer.observe(hero); observer.observe(offer);
  }
})();
