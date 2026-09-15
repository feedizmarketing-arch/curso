(() => {
  'use strict';
  const config = window.GROWTHOS_CONFIG || {};
  const measurementEnabled = config.trackingEnabled === true && location.hostname === 'www.douglasmaronese.com.br' && !new URLSearchParams(location.search).has('qa');
  const regularPrice = Number.isFinite(config.price) && config.price > 0 ? config.price : 47.90;
  let price = regularPrice;
  const formatMoney = value => new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL'}).format(value);
  const promotion = config.promotion || {};
  // Explicit legacy links only. A stored coupon must not silently change the new offer.
  const requestedCoupon = (new URLSearchParams(location.search).get('coupon') || '').trim().toUpperCase();
  const promotionIsActive = () => requestedCoupon === promotion.code && promotion.discountPercent > 0 && promotion.discountPercent < 100 && Date.now() >= Date.parse(promotion.startsAt) && Date.now() < Date.parse(promotion.endsAt);
  let coupon = '';
  try { sessionStorage.removeItem('growthos_coupon'); } catch {}
  function renderPrice() {
    coupon = promotionIsActive() ? promotion.code : '';
    price = coupon ? Math.round(regularPrice * (100-promotion.discountPercent))/100 : regularPrice;
    document.querySelectorAll('.price').forEach(el => { el.textContent = formatMoney(price); });
    document.querySelectorAll('[data-price-number]').forEach(el => { el.textContent = price.toLocaleString('pt-BR',{minimumFractionDigits:2}); });
    const notice = document.getElementById('legacy-price');
    if (notice) {
      notice.hidden = !requestedCoupon;
      notice.textContent = coupon ? `Condição já divulgada: ${coupon} aplicado. Total ${formatMoney(price)}. Válido até ${promotion.dateLabel}.` : 'Confira a oferta atual: o código deste link não está ativo.';
    }
    document.querySelectorAll('[data-buy]').forEach(link => {
      const checkout = buildCheckoutUrl(config.checkoutUrl,location.search);
      if (checkout && link.tagName === 'A') link.href = checkout;
    });
  }
  renderPrice();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) renderPrice(); });
  setInterval(renderPrice,30000);
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
    if (pixelStarted || preference !== 'yes' || !measurementEnabled || !/^\d+$/.test(String(config.metaPixelId || '')) || location.protocol === 'file:') return;
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
  if (cookieBar && measurementEnabled && !['yes','no'].includes(preference)) cookieBar.hidden = false;
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
  document.querySelectorAll('[data-buy]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    if (coupon && !promotionIsActive()) {
      renderPrice();
      const message = document.getElementById('legacy-price');
      if (message) { message.textContent = 'A promoção encerrou. O preço foi atualizado. Confira o valor antes de continuar.'; message.scrollIntoView({block:'center'}); }
      return;
    }
    const checkout = buildCheckoutUrl(config.checkoutUrl,location.search);
    if (config.checkoutReady !== true || !checkout) { openDialog(document.getElementById('availability-dialog')); return; }
    if (pixelStarted && preference === 'yes' && window.fbq) window.fbq('trackCustom','CheckoutClick',{content_name:'GrowthOS — Marketing que Vende',value:price,currency:'BRL',offer_version:config.offerVersion || 'direct'});
    window.location.assign(checkout);
  }));

  // Sample from the delivered prompt collection. No user-entered text is sent to analytics.
  document.getElementById('sample-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const product = document.getElementById('sample-product').value.trim();
    const audience = document.getElementById('sample-audience').value.trim();
    const delivery = document.getElementById('sample-delivery').value.trim();
    if (!product || !audience || !delivery) return;
    const output = document.getElementById('sample-output');
    output.value = 'CONTEXTO DO MEU NEGÓCIO\nProduto ou serviço: ' + product + '\nPúblico e situação: ' + audience + '\nEntrega confirmada: ' + delivery + '\n\nCOMANDO\n' + "Crie 5 versões de uma frase de oferta contendo produto, público ou situação de uso, benefício principal e condição comercial confirmada. Use até 25 palavras por versão. Evite garantias de resultado, superlativos vazios e urgência inventada. Escolha a mais clara e explique o motivo em duas linhas.";
    document.getElementById('sample-result').hidden = false;
    document.getElementById('sample-result').scrollIntoView({block:'center',behavior:'smooth'});
    if (pixelStarted && preference === 'yes' && window.fbq) window.fbq('trackCustom','SampleUsed',{sample:'prompt_05',offer_version:config.offerVersion});
  });
  document.getElementById('sample-copy')?.addEventListener('click', async () => {
    const output = document.getElementById('sample-output');
    const status = document.getElementById('sample-status');
    try { await navigator.clipboard.writeText(output.value); status.textContent = 'Copiado. Cole na ferramenta de IA que você usa e revise a resposta.'; }
    catch { output.focus(); output.select(); status.textContent = 'Selecione e copie o texto acima.'; }
  });
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
