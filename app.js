(() => {
  'use strict';
  const config = window.GROWTHOS_CONFIG || {};
  const regularPrice = Number.isFinite(config.price) && config.price > 0 ? config.price : 47.90;
  let price = regularPrice;
  const formatMoney = value => new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL',minimumFractionDigits:2}).format(value);
  const promotion = config.promotion || {};
  const normalizeCoupon = value => String(value || '').trim().toUpperCase();
  const readCoupon = () => { try { return sessionStorage.getItem('growthos_coupon') || ''; } catch { return ''; } };
  const rememberCoupon = value => { try { value ? sessionStorage.setItem('growthos_coupon',value) : sessionStorage.removeItem('growthos_coupon'); } catch {} };
  let coupon = '';
  const promotionIsActive = () => /^[A-Z0-9]{1,30}$/.test(promotion.code || '') && promotion.discountPercent > 0 && promotion.discountPercent < 100 && Date.now() >= Date.parse(promotion.startsAt) && Date.now() < Date.parse(promotion.endsAt);
  function renderPrice() {
    if (!promotionIsActive()) {
      const wasApplied = Boolean(coupon);
      coupon = ''; rememberCoupon('');
      if (wasApplied) {
        const status = document.getElementById('coupon-message');
        if (status) status.textContent = 'A promoção encerrou. Confira o preço atualizado antes de continuar.';
      }
    }
    price = coupon ? Math.round(regularPrice * (100 - promotion.discountPercent)) / 100 : regularPrice;
    document.querySelectorAll('.price').forEach(el => { el.textContent = formatMoney(price); });
    document.querySelectorAll('[data-price-number]').forEach(el => { el.textContent = price.toLocaleString('pt-BR',{minimumFractionDigits:2}); });
    document.querySelectorAll('[data-regular-price]').forEach(el => { el.textContent = formatMoney(regularPrice); });
    document.querySelectorAll('[data-promo-applied]').forEach(el => { el.hidden = !coupon; });
    document.querySelectorAll('[data-promo-date]').forEach(el => { el.textContent = promotion.dateLabel || ''; });
    document.querySelectorAll('[data-promo-available]').forEach(el => { el.hidden = !promotionIsActive(); });
    document.querySelectorAll('[data-promo-unapplied]').forEach(el => { el.hidden = !promotionIsActive() || Boolean(coupon); });
    document.querySelectorAll('[data-discount-price]').forEach(el => { el.textContent = formatMoney(Math.round(regularPrice * (100 - promotion.discountPercent)) / 100); });
    const claim = document.getElementById('claim-coupon');
    if (claim) claim.disabled = !promotionIsActive();
    if (!promotionIsActive()) {
      const claimMessage = document.getElementById('claim-message');
      if (claimMessage) claimMessage.textContent = 'A promoção de lançamento encerrou. O curso continua disponível pelo preço normal.';
    }
    const remove = document.getElementById('coupon-remove');
    if (remove) remove.hidden = !coupon;
  }
  function applyCoupon(value) {
    const valid = promotionIsActive() && normalizeCoupon(value) === promotion.code;
    coupon = valid ? promotion.code : '';
    rememberCoupon(coupon);
    try {
      const current = new URL(location.href);
      if (coupon) current.searchParams.set('coupon',coupon); else current.searchParams.delete('coupon');
      history.replaceState(null,'',current);
    } catch {}
    renderPrice();
    const message = document.getElementById('coupon-message');
    if (message) message.textContent = valid ? `Cupom ${coupon} aplicado. Total: ${formatMoney(price)}.` : 'Cupom não reconhecido ou fora da validade. Confira o código.';
    return valid;
  }
  const searchCoupon = new URLSearchParams(location.search);
  const incomingCoupon = searchCoupon.has('coupon') ? searchCoupon.get('coupon') : readCoupon();
  if (incomingCoupon) applyCoupon(incomingCoupon);
  renderPrice();
  const couponForm = document.getElementById('coupon-form');
  if (couponForm) {
    couponForm.hidden = false;
    const input = document.getElementById('coupon-code');
    if (input && coupon) input.value = coupon;
    couponForm.addEventListener('submit', event => { event.preventDefault(); applyCoupon(input?.value); });
  }
  document.getElementById('coupon-remove')?.addEventListener('click', () => {
    coupon = ''; rememberCoupon(''); renderPrice();
    document.getElementById('coupon-code').value = '';
    document.getElementById('coupon-message').textContent = 'Cupom removido. Preço normal restaurado.';
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) renderPrice(); });
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key,value) => { try { localStorage.setItem(key,value); } catch {} };
  let preference = read('growthos_marketing');
  let pixelStarted = false;
  function openDialog(dialog) {
    if (!dialog || dialog.open) return;
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
  document.querySelectorAll('[data-get-coupon]').forEach(button => button.addEventListener('click', () => {
    renderPrice();
    if (promotionIsActive()) openDialog(document.getElementById('coupon-dialog'));
    else document.getElementById('oferta')?.scrollIntoView({block:'start'});
  }));
  document.getElementById('claim-coupon')?.addEventListener('click', () => {
    if (!applyCoupon(promotion.code)) return;
    const input = document.getElementById('coupon-code');
    if (input) input.value = coupon;
    closeDialog(document.getElementById('coupon-dialog'));
    document.getElementById('offer-card')?.scrollIntoView({block:'start',behavior:'smooth'});
    const url = new URL(location.href);
    url.searchParams.set('coupon',coupon);
    try { history.replaceState(null,'',url); } catch {}
  });
  document.getElementById('coupon-remove')?.addEventListener('click', () => {
    const url = new URL(location.href); url.searchParams.delete('coupon');
    try { history.replaceState(null,'',url); } catch {}
  });
  const videoDialog = document.getElementById('video-dialog');
  const videoPlayer = document.getElementById('video-player');
  const approvedVideos = new Set(['Z44EnyTnUDY','0084bYulTM4','vipSdIdimD4','1gv34vINJhg','Yi520kPzUoQ']);
  document.querySelectorAll('[data-video]').forEach(link => link.addEventListener('click', event => {
    const id = link.dataset.video;
    if (!approvedVideos.has(id) || !videoPlayer || !videoDialog) return;
    event.preventDefault();
    const title = `Depoimento de ${link.dataset.videoName || 'participante'}`;
    document.getElementById('video-title').textContent = title;
    document.getElementById('video-external').href = `https://www.youtube.com/watch?v=${id}`;
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    frame.title = title;
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    videoPlayer.replaceChildren(frame);
    openDialog(videoDialog);
  }));
  videoDialog?.addEventListener('close', () => videoPlayer?.replaceChildren());
  document.querySelectorAll('[data-scroll-rail]').forEach(button => button.addEventListener('click', () => {
    const rail = document.querySelector('.testimonial-rail');
    if (rail) rail.scrollBy({left:Number(button.dataset.scrollRail) * rail.clientWidth * .85,behavior:'smooth'});
  }));
  function updateDeadline() {
    const remaining = Date.parse(promotion.endsAt) - Date.now();
    if (!promotionIsActive()) { renderPrice(); return; }
    const minutes = Math.max(0,Math.floor(remaining/60000));
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440)/60);
    document.querySelectorAll('[data-countdown]').forEach(el => { el.textContent = `O desconto encerra em ${days}d ${hours}h ${minutes % 60}min.`; });
  }
  updateDeadline();
  setInterval(updateDeadline,30000);
  document.getElementById('privacy-open')?.addEventListener('click', () => openDialog(document.getElementById('privacy-dialog')));
  try {
    const canonical = new URL(config.canonicalUrl);
    if (canonical.protocol === 'https:') {
      const link = document.querySelector('link[rel=canonical]') || document.createElement('link'); link.rel = 'canonical'; link.href = canonical.href; document.head.append(link);
      const og = document.querySelector('meta[property="og:url"]') || document.createElement('meta'); og.setAttribute('property','og:url'); og.content = canonical.href; document.head.append(og);
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
      url.searchParams.delete('coupon');
      if (coupon && promotionIsActive()) url.searchParams.set('coupon',coupon);
      return url.href;
    } catch { return null; }
  }
  document.querySelectorAll('[data-buy]').forEach(button => button.addEventListener('click', () => {
    if (coupon && !promotionIsActive()) {
      renderPrice();
      const message = document.getElementById('coupon-message');
      if (message) { message.textContent = 'A promoção encerrou. O preço foi atualizado. Confira o valor antes de continuar.'; message.scrollIntoView({block:'center'}); }
      return;
    }
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
