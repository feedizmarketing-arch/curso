(() => {
  'use strict';
  const config = window.GROWTHOS_CONFIG || {};
  const promo = config.promotion || {};
  const active = () => promo.code === 'FEEDIZ' && Date.now() >= Date.parse(promo.startsAt) && Date.now() < Date.parse(promo.endsAt);
  function update() {
    const valid = active();
    document.getElementById('bio-promotion').hidden = !valid;
    document.getElementById('bio-ended').hidden = valid;
    const checkout = new URL('https://pay.kiwify.com.br/xQxZtk8');
    const details = new URL('../',location.href);
    const incoming = new URLSearchParams(location.search);
    for (const destination of [checkout,details]) {
      destination.searchParams.set('utm_source','instagram');
      destination.searchParams.set('utm_medium','bio');
      destination.searchParams.set('utm_campaign','lancamento_growthos');
      const content = incoming.get('utm_content');
      if (content && content.length < 100) destination.searchParams.set('utm_content',content);
      if (valid) destination.searchParams.set('coupon',promo.code);
    }
    const button = document.getElementById('bio-checkout');
    button.href = checkout.href;
    button.textContent = valid ? 'QUERO O CURSO POR R$ 17,72 ↗' : 'QUERO O CURSO POR R$ 47,90 ↗';
    document.getElementById('bio-details').href = details.href;
  }
  update();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  document.getElementById('bio-checkout').addEventListener('click',event => {
    if (!active() && !document.getElementById('bio-promotion').hidden) { event.preventDefault(); update(); }
  });
})();
