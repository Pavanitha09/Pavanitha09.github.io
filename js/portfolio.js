/* Pavanitha Manche — portfolio interactions (no dependencies) */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  /* ---------- helpers ---------- */
  var toastEl = $('#toast'), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2000);
  }
  function copy(text, okMsg) {
    var done = function () { toast(okMsg || 'Copied'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('Press Ctrl+C to copy'); }
      document.body.removeChild(ta);
    }
  }

  /* ---------- theme ---------- */
  function setTheme(t) {
    doc.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (e) {}
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'light' ? '#f6f4ee' : '#07080c');
    drawColors();
  }
  function toggleTheme() { setTheme(doc.getAttribute('data-theme') === 'light' ? 'dark' : 'light'); }
  $('#theme').addEventListener('click', toggleTheme);

  /* ---------- tech chips: color by category + stagger ---------- */
  (function () {
    var R = {
      lang: /^(Python|C#|C\+\+|C|Java|JavaScript|SQL|Bash)$/i,
      genai: /^(LLM|LLMs|LLM |RAG|AI Agents|MCP|LangChain|LangGraph|Vector|ChromaDB|Prompt|Whisper|FENICE|Text-to|Idempotency)/i,
      ml: /^(NLI|NLP|DeBERTa|ModernBERT|wav2vec|Conformer|ECAPA|x-vectors|t-SNE|Fine-tuning|Speech|Speaker|ASR|Model|PyTorch|TensorFlow|Hugging|Evaluation|Annotation|Research|Edge|Machine)/i,
      fs: /^(\.NET|React|Angular|Node|REST|Flask|PostgreSQL|SQL Server|MongoDB|MQTT|Elasticsearch|Web Crawling|Information|Stripe|Fault)/i,
      data: /^(Power BI|SSAS|DAX|SAP|Docker|Kubernetes|Azure|GCP|Jenkins|Git|Linux|Data Structures)/i
    };
    function kind(tx) { for (var k in R) { if (R[k].test(tx)) return k; } return 'neutral'; }
    $$('.chips').forEach(function (wrap) {
      $$('.chip', wrap).forEach(function (ch, i) {
        var tx = ch.textContent.trim();
        ch.classList.add('c-' + kind(tx));
        ch.style.setProperty('--i', i);
      });
    });
    /* skills: one color per card, matching the card's group */
    $$('.skills-grid .card').forEach(function (card) {
      var h = ($('h3', card) || {}).textContent || '', cls = /Generative/i.test(h) ? 'c-genai' : /Machine/i.test(h) ? 'c-ml' : /Data/i.test(h) ? 'c-data' : /Full-stack/i.test(h) ? 'c-fs' : 'c-lang';
      $$('.chip', card).forEach(function (ch) { ch.classList.remove('c-lang', 'c-genai', 'c-ml', 'c-fs', 'c-data', 'c-neutral'); ch.classList.add(cls); });
    });
  })();

  /* ---------- portrait tilt ---------- */
  (function () {
    var pc = $('.portrait-card'), fr = pc && $('.frame', pc);
    if (!fr || window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    pc.addEventListener('mousemove', function (e) {
      var r = pc.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      fr.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg');
      fr.style.setProperty('--rx', (-y * 14).toFixed(2) + 'deg');
    });
    pc.addEventListener('mouseleave', function () { fr.style.setProperty('--rx', '0deg'); fr.style.setProperty('--ry', '0deg'); });
  })();

  /* ---------- scroll progress ---------- */
  var tp = $('#top-progress');
  if (tp) {
    var tick = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      tp.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
    };
    window.addEventListener('scroll', tick, { passive: true }); tick();
  }

  /* ---------- keyboard hint text ---------- */
  var hint = isMac ? '⌘ K' : 'Ctrl K';
  $('#kbd-hint').textContent = hint;
  var kf = $('#kbd-foot'); if (kf) kf.textContent = hint;

  /* ---------- nav ---------- */
  var nav = $('#nav');
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 12);
    updateTimeline();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  var menuBtn = $('#menu'), links = $('#links');
  menuBtn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  $$('#links a').forEach(function (a) {
    a.addEventListener('click', function () { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); });
  });

  /* active link */
  var secs = ['about', 'experience', 'projects', 'publications', 'skills', 'contact'].map(function (id) { return document.getElementById(id); });
  if ('IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          $$('#links a.l').forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { if (s) navIO.observe(s); });
  }

  /* ---------- reveal ---------- */
  var rvs = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var rvIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rvIO.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rvs.forEach(function (el) { rvIO.observe(el); });
  } else { rvs.forEach(function (el) { el.classList.add('in'); }); }

  /* timeline dots light up as their card is revealed */
  $$('.tl-item').forEach(function (it) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es, o) {
        es.forEach(function (e) { if (e.isIntersecting) { it.classList.add('in'); o.disconnect(); } });
      }, { rootMargin: '0px 0px -30% 0px' }).observe(it);
    } else { it.classList.add('in'); }
  });

  /* scroll-driven timeline line */
  var tl = $('#timeline'), tlp = $('#tl-progress');
  function updateTimeline() {
    if (!tl) return;
    var r = tl.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.6 - r.top) / (r.height || 1);
    p = Math.max(0, Math.min(1, p));
    tlp.style.height = 'calc((100% - 16px) * ' + p.toFixed(4) + ')';
  }
  updateTimeline();

  /* ---------- counters ---------- */
  function fmt(n, dec) {
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function runCount(el) {
    var target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || '0', 10), suf = el.dataset.suffix || '';
    var t0 = null, dur = reduce ? 1100 : 1600;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(target * e, dec) + (k === 1 ? suf : '');
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var cIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cIO.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cIO.observe(c); });
  } else { counters.forEach(runCount); }

  /* ---------- project bars ---------- */
  $$('.viz').forEach(function (viz) {
    function fillBars() { $$('.fill', viz).forEach(function (f) { f.style.width = f.dataset.w + '%'; }); }
    if ('IntersectionObserver' in window) {
      var vIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { fillBars(); vIO.disconnect(); } });
      }, { threshold: 0.3 });
      vIO.observe(viz);
    } else { fillBars(); }
  });

  /* ---------- typewriter ---------- */
  var typed = $('#typed');
  var phrases = ['Software Engineer', 'Applied AI & LLM systems', 'Backend & distributed systems', 'Full-stack developer', 'Researcher in speech & NLP'];
  if (typed && !reduce) {
    var pi = 0, ci = phrases[0].length, del = true;
    setTimeout(function tick() {
      var word = phrases[pi];
      if (del) { ci--; } else { ci++; }
      typed.textContent = word.slice(0, ci);
      var wait = del ? 28 : 62;
      if (!del && ci === word.length) { del = true; wait = 1700; }
      else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; wait = 280; }
      setTimeout(tick, wait);
    }, 2200); // first phrase holds before cycling begins
  }

  /* ---------- cursor spotlight + card glow ---------- */
  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    var spot = $('.spot');
    window.addEventListener('mousemove', function (e) {
      spot.style.setProperty('--mx', e.clientX + 'px');
      spot.style.setProperty('--my', e.clientY + 'px');
    }, { passive: true });
    $$('.card').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--cx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--cy', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- project filters ---------- */
  var fbtns = $$('.filters button'), projs = $$('.proj');
  function applyFilter(f) {
    fbtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.filter === f ? 'true' : 'false'); });
    projs.forEach(function (p) {
      var show = f === 'all' || p.dataset.cat.split(' ').indexOf(f) > -1;
      p.classList.toggle('hide', !show);
      if (show) p.classList.add('in');
    });
  }
  fbtns.forEach(function (b) { b.addEventListener('click', function () { applyFilter(b.dataset.filter); }); });

  /* ---------- publications: copy citation / BibTeX ---------- */
  $$('[data-copy="cite"]').forEach(function (b) {
    b.addEventListener('click', function () { copy(document.getElementById(b.dataset.target).textContent.trim(), 'Citation copied'); });
  });
  $$('[data-bib]').forEach(function (b) {
    b.addEventListener('click', function () {
      var box = document.getElementById(b.dataset.bib);
      var open = box.classList.toggle('open');
      b.setAttribute('aria-expanded', open);
      b.textContent = open ? 'Hide BibTeX' : 'BibTeX';
      if (open) {
        var pre = $('pre', box);
        if (!box.dataset.copied) {
          var cb = document.createElement('button');
          cb.type = 'button'; cb.className = 'pill'; cb.style.marginTop = '10px'; cb.textContent = 'Copy BibTeX';
          cb.addEventListener('click', function () { copy(pre.textContent, 'BibTeX copied'); });
          box.appendChild(cb); box.dataset.copied = '1';
        }
      }
    });
  });

  var ce = $('#copy-email');
  if (ce) ce.addEventListener('click', function () { copy('manche@usc.edu', 'Email copied'); });

  /* ---------- command palette ---------- */
  var back = $('#pal-back'), input = $('#pal-input'), list = $('#pal-list');
  var lastFocus = null, sel = 0, shown = [];

  function go(id, filter) {
    if (filter) applyFilter(filter);
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: id.indexOf('p-') === 0 || id.indexOf('pub-') === 0 ? 'center' : 'start' });
  }
  function open(url) { window.open(url, '_blank', 'noopener'); }

  var items = [
    { g: 'Go to', t: 'About', h: 'section', k: 'bio intro', run: function () { go('about'); } },
    { g: 'Go to', t: 'Education', h: 'section', k: 'usc iit dharwad gpa degree', run: function () { go('education'); } },
    { g: 'Go to', t: 'Experience', h: 'section', k: 'work jobs timeline abb keck dvara', run: function () { go('experience'); } },
    { g: 'Go to', t: 'Projects', h: 'section', k: 'work portfolio', run: function () { go('projects', 'all'); } },
    { g: 'Go to', t: 'Publications', h: 'section', k: 'papers doi', run: function () { go('publications'); } },
    { g: 'Go to', t: 'Skills', h: 'section', k: 'tech stack languages', run: function () { go('skills'); } },
    { g: 'Go to', t: 'Achievements & leadership', h: 'section', k: 'awards honors mentor certifications hackathon', run: function () { go('achievements'); } },
    { g: 'Go to', t: 'Contact', h: 'section', k: 'email hire', run: function () { go('contact'); } },

    { g: 'Projects', t: 'Rewind: exactly-once execution for LLM agents', h: 'featured', k: 'langgraph agents postgres stripe', run: function () { go('p-rewind', 'all'); } },
    { g: 'Projects', t: 'Voice OTP Authentication', h: 'research', k: 'speech speaker verification conformer', run: function () { go('p-voiceotp', 'all'); } },
    { g: 'Projects', t: 'OmniLens: Shared / New / Conflicting claims', h: 'NLP', k: 'nli deberta modernbert claims classification', run: function () { go('p-omnilens', 'all'); } },
    { g: 'Projects', t: 'Custom Search Engine for Government Websites', h: 'NITI Aayog', k: 'elasticsearch crawling flask react', run: function () { go('p-search', 'all'); } },

    { g: 'Filter projects', t: 'Show AI & agent projects', h: 'filter', k: 'machine learning llm', run: function () { go('projects', 'ai'); } },
    { g: 'Filter projects', t: 'Show backend & search projects', h: 'filter', k: 'distributed elasticsearch', run: function () { go('projects', 'backend'); } },
    { g: 'Filter projects', t: 'Show NLP & speech projects', h: 'filter', k: 'nli speech asr', run: function () { go('projects', 'nlp'); } },

    { g: 'Papers', t: 'SPECOM 2023 · Voice OTP Authentication System', h: 'open DOI', k: 'springer paper', run: function () { open('https://doi.org/10.1007/978-3-031-48312-7_41'); } },
    { g: 'Papers', t: 'IEEE SPCOM 2024 · Speaker and Digit Representation', h: 'open DOI', k: 'ieee paper', run: function () { open('https://doi.org/10.1109/SPCOM60851.2024.10631646'); } },

    { g: 'Actions', t: 'Toggle light / dark theme', h: 'theme', k: 'mode appearance', run: toggleTheme },
    { g: 'Actions', t: 'Open résumé (PDF)', h: 'pdf', k: 'cv download', run: function () { open('Pavanitha_Manche_Resume.pdf'); } },
    { g: 'Actions', t: 'Copy email address', h: 'manche@usc.edu', k: 'contact', run: function () { copy('manche@usc.edu', 'Email copied'); } },
    { g: 'Actions', t: 'Send an email', h: 'mailto', k: 'contact hire', run: function () { location.href = 'mailto:manche@usc.edu'; } },
    { g: 'Links', t: 'GitHub', h: 'Pavanitha09', k: 'code', run: function () { open('https://github.com/Pavanitha09'); } },
    { g: 'Links', t: 'LinkedIn', h: 'profile', k: 'social', run: function () { open('https://www.linkedin.com/in/pavanitha-manche-371564200/'); } },
    { g: 'Links', t: 'Google Scholar', h: 'citations', k: 'papers', run: function () { open('https://scholar.google.com/citations?user=mZlZum8AAAAJ&hl=en'); } }
  ];

  function render() {
    var q = input.value.trim().toLowerCase();
    var toks = q ? q.split(/\s+/) : [];
    shown = items.filter(function (it) {
      var hay = (it.t + ' ' + it.g + ' ' + it.h + ' ' + (it.k || '')).toLowerCase();
      return toks.every(function (t) { return hay.indexOf(t) > -1; });
    });
    if (sel >= shown.length) sel = 0;
    list.innerHTML = '';
    if (!shown.length) {
      var em = document.createElement('div'); em.className = 'pal-empty'; em.textContent = 'No results. Try “rewind”, “paper” or “theme”.'; list.appendChild(em); return;
    }
    var lastG = '';
    shown.forEach(function (it, i) {
      if (it.g !== lastG) { var g = document.createElement('div'); g.className = 'pal-group'; g.textContent = it.g; list.appendChild(g); lastG = it.g; }
      var d = document.createElement('div');
      d.className = 'pal-item'; d.setAttribute('role', 'option'); d.setAttribute('aria-selected', i === sel ? 'true' : 'false'); d.dataset.i = i;
      var a = document.createElement('span'); a.textContent = it.t;
      var b = document.createElement('span'); b.className = 'hint'; b.textContent = it.h;
      d.appendChild(a); d.appendChild(b);
      d.addEventListener('mousemove', function () { if (sel !== i) { sel = i; mark(); } });
      d.addEventListener('click', function () { run(i); });
      list.appendChild(d);
    });
  }
  function mark() {
    $$('.pal-item', list).forEach(function (el) {
      var on = parseInt(el.dataset.i, 10) === sel;
      el.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) el.scrollIntoView({ block: 'nearest' });
    });
  }
  function run(i) { var it = shown[i]; if (!it) return; close(); setTimeout(it.run, 60); }
  function openPal() {
    lastFocus = document.activeElement; back.classList.add('open');
    input.value = ''; sel = 0; render(); input.focus();
    document.body.style.overflow = 'hidden';
  }
  function close() {
    back.classList.remove('open'); document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $('#open-pal').addEventListener('click', openPal);
  back.addEventListener('mousedown', function (e) { if (e.target === back) close(); });
  input.addEventListener('input', function () { sel = 0; render(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
    else if (e.key === 'Enter') { e.preventDefault(); run(sel); }
  });
  document.addEventListener('keydown', function (e) {
    var isOpen = back.classList.contains('open');
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); isOpen ? close() : openPal(); }
    else if (e.key === 'Escape' && isOpen) { close(); }
    else if (e.key === '/' && !isOpen && !/input|textarea/i.test((document.activeElement || {}).tagName || '')) { e.preventDefault(); openPal(); }
  });

  /* ---------- animated network background ---------- */
  var cv = $('#bg-canvas'), ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, pts = [], rgb = '110,240,194', rgb2 = '139,123,255', mouse = { x: -999, y: -999 }, running = true;
  function drawColors() {
    var light = doc.getAttribute('data-theme') === 'light';
    rgb = light ? '11,122,90' : '110,240,194';
    rgb2 = light ? '91,70,224' : '139,123,255';
  }
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(90, Math.max(28, (W * H) / 20000)));
    pts = [];
    for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28, r: Math.random() * 1.4 + .6 });
  }
  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    var link = 130, i, j, a, b, dx, dy, d;
    for (i = 0; i < pts.length; i++) {
      a = pts[i];
      if (!reduce) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        dx = a.x - mouse.x; dy = a.y - mouse.y; d = dx * dx + dy * dy;
        if (d < 14000) { a.x += dx * .0016; a.y += dy * .0016; }
      }
      for (j = i + 1; j < pts.length; j++) {
        b = pts[j]; dx = a.x - b.x; dy = a.y - b.y; d = dx * dx + dy * dy;
        if (d < link * link) {
          ctx.strokeStyle = 'rgba(' + (i % 3 ? rgb : rgb2) + ',' + (0.2 * (1 - Math.sqrt(d) / link)).toFixed(3) + ')';
          ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(' + rgb + ',.55)'; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill();
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { size(); if (reduce) frame(); }, 150); });
  document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) frame(); });
  drawColors(); size(); frame();
  onScroll();
})();
