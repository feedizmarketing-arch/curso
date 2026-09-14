(() => {
  'use strict';
  const config = window.GROWTHOS_CONFIG || {};
  const promo = config.promotion || {};
  const price = Number(config.price) || 47.90;
  const money = n => n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const active = () => promo.code === 'FEEDIZ' && Date.now() >= Date.parse(promo.startsAt) && Date.now() < Date.parse(promo.endsAt);
  function update() {
    const valid = active();
    document.getElementById('bio-promotion').hidden = !valid;
    document.getElementById('bio-ended').hidden = valid;
    const total = valid ? Math.round(price*(100-promo.discountPercent))/100 : price;
    document.querySelectorAll('[data-bio-price]').forEach(el=>{el.textContent=money(total);});
    const checkout = new URL(config.checkoutUrl);
    if (checkout.protocol !== 'https:' || checkout.hostname !== 'pay.kiwify.com.br') return;
    const details = new URL('../',location.href);
    const incoming = new URLSearchParams(location.search);
    for (const destination of [checkout,details]) {
      destination.searchParams.set('utm_source','instagram');
      destination.searchParams.set('utm_medium','bio');
      destination.searchParams.set('utm_campaign','lancamento_growthos');
      const content=incoming.get('utm_content');
      if(content && content.length<100) destination.searchParams.set('utm_content',content);
      destination.searchParams.delete('coupon');
      if(valid) destination.searchParams.set('coupon',promo.code);
    }
    const button = document.getElementById('bio-checkout');
    button.href = checkout.href;
    button.textContent = `QUERO O CURSO POR ${money(total)} ↗`;
    document.getElementById('bio-details').href = details.href;
  }
  update();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden) update();});
  setInterval(update,30000);
  document.getElementById('bio-checkout').addEventListener('click',event=>{
    if(!active() && !document.getElementById('bio-promotion').hidden){event.preventDefault();update();}
  });
})();
