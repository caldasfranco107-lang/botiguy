/* G-Bot: asistente local (client-side)
   - Indexa títulos y párrafos del DOM para responder.
   - Contiene respuestas predefinidas.
   - Chat simple (local), y botones rápidos que abren las categorías.
   - No hace llamadas externas.
*/

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const gbtn = document.getElementById('gbot-btn');
  const modal = document.getElementById('gbot-modal');
  const closeBtn = document.getElementById('gbot-close');
  const tabs = Array.from(document.querySelectorAll('.gbot-tab'));
  const panels = Array.from(document.querySelectorAll('.gbot-panel'));
  const opts = Array.from(document.querySelectorAll('.opt'));
  const faqContainer = document.getElementById('gbot-faq');
  const chatBox = document.getElementById('gbot-chat');
  const form = document.getElementById('gbot-form');
  const input = document.getElementById('gbot-input');

  // show/hide modal
  gbtn.addEventListener('click', () => {
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    buildFAQ();
    welcome();
  });
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  });

  // tabs
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const tt = t.dataset.tab;
      panels.forEach(p => { p.style.display = (p.dataset.panel === tt) ? 'block' : 'none'; });
      if (tt === 'chat' && input) input.focus();
    });
  });

  // quick options open urls
  opts.forEach(b => {
    b.addEventListener('click', () => {
      const url = b.dataset.url;
      if (url) window.open(url, '_blank');
    });
  });

  // Build basic knowledge from page
  function buildKnowledge() {
    const kb = [];
    ['h1','h2','h3','p'].forEach(sel => {
      document.querySelectorAll(sel).forEach(n => {
        const t = n.innerText.trim();
        if (t && t.length > 8) kb.push({text: t, tag: n.tagName.toLowerCase()});
      });
    });

    const canned = [
      {q:'¿qué ofrece botiguy', a:'Botiguy ofrece productos y servicios en Peluquería & Barbería, Belleza Mascotas, Automóviles y otras categorías como Cuidado Personal, Verano, Hogar, Camping, Tecnología y Gadgets.'},
      {q:'¿cómo accedo a la tienda', a:'Puedes visitar la tienda oficial en https://botiguy.demo-store.website/ o pulsar cualquiera de los botones de categoría en esta página.'},
      {q:'¿hacen envíos', a:'Los detalles de envíos y políticas aparecen en la tienda oficial — abre la categoría o el producto para ver condiciones y tiempos.'},
      {q:'productos para mascotas', a:'En Belleza Mascotas encontrarás shampoos, acondicionadores, accesorios y productos de grooming.'},
      {q:'productos para autos', a:'En Automóviles hay kits de limpieza, ceras, accesorios y artículos de detailing.'}
    ];

    return {kb, canned};
  }

  let knowledge = buildKnowledge();

  function buildFAQ() {
    faqContainer.innerHTML = '';
    const {kb, canned} = knowledge;
    canned.forEach(c => {
      const el = document.createElement('div');
      el.className = 'faq-item';
      el.innerHTML = `<strong>Q:</strong> ${c.q} <br/><strong>A:</strong> ${c.a}`;
      faqContainer.appendChild(el);
    });
    // add some page snippets
    kb.slice(0,5).forEach(k => {
      const el = document.createElement('div');
      el.className = 'faq-item';
      el.innerHTML = `<strong>Info:</strong> ${k.text}`;
      faqContainer.appendChild(el);
    });
  }

  function welcome() {
    chatBox.innerHTML = '';
    appendBot('Hola 👋 — soy G-Bot. Puedo ayudarte a encontrar categorías, productos y cómo visitar la tienda. Prueba con: "¿Qué ofrecen?" o pulsa una opción rápida.');
  }

  function appendUser(text) {
    const d = document.createElement('div');
    d.className = 'message user';
    d.textContent = text;
    chatBox.appendChild(d);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  function appendBot(text) {
    const d = document.createElement('div');
    d.className = 'message bot';
    d.textContent = text;
    chatBox.appendChild(d);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // very simple retrieval / match
  function answerQuery(q) {
    const text = q.toLowerCase();
    // check canned
    for (const c of knowledge.canned) {
      if (text.includes(c.q.split(' ')[0]) || text.includes(c.q.replace(/\W/g,''))) return c.a;
    }
    // score KB
    const toks = text.split(/\W+/).filter(Boolean);
    let best = {s:0, text:''};
    knowledge.kb.forEach(item => {
      let s = 0;
      toks.forEach(t => { if (item.text.toLowerCase().includes(t)) s++; });
      if (s > best.s) best = {s, text: item.text};
    });
    if (best.s > 0) return `Según el sitio: "${best.text}". ¿Quieres que abra la tienda para esa categoría?`;
    return 'Lo siento, no encuentro esa información exacta aquí. Puedo abrir la tienda o puedes preguntar otra cosa.';
  }

  // chat submit
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      appendUser(val);
      input.value = '';
      setTimeout(() => {
        const resp = answerQuery(val);
        appendBot(resp);
      }, 500 + Math.random() * 500);
    });
  }

  // expose controls (dev)
  window.GBot = {
    refresh: () => { knowledge = buildKnowledge(); buildFAQ(); welcome(); },
    answerQuery
  };

  // initial build
  buildFAQ();
  welcome();
});

