// helper
const qs  = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);

/* NAV TAB SWITCH */
function initNav() {
  // kalau halaman ini adalah news-detail atau rundown, jangan aktifin mode SPA
  const pageType = document.body.dataset.page;
  if (pageType === 'news-detail' || pageType === 'rundown') return;


  // hanya handle link yang punya data-target (SPA)
  const links = qsa('.menu a[data-target], .brand[data-target]');
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.dataset.target || 'home';
      showSection(target);
      if (window.innerWidth < 900) {
        const menu = qs('#menu');
        const ham = qs('#hamburger');
        menu.style.display = 'none';
        ham.classList.remove('open');
      }
    });
  });
}

function initNavScroll() {
  const nav = qs('.nav');
  if (!nav) return;

  const handleScroll = () => {
    if (window.scrollY > 4) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  // panggil sekali saat load
  handleScroll();
  window.addEventListener('scroll', handleScroll);
}

function showSection(id) {
  qsa('.page').forEach(p => p.classList.add('hide'));
  const sec = qs('#' + id);
  if (sec) sec.classList.remove('hide');

  qsa('.menu a[data-target]').forEach(a => {
    a.classList.toggle('active', a.dataset.target === id);
  });
}


/* THEME (LIGHT/DARK) */
function applyTheme(theme){
  const body = document.body;
  if(theme === 'dark'){
    body.classList.add('dark');
  }else{
    body.classList.remove('dark');
  }
}

function initTheme(){
  const saved = localStorage.getItem('dt-theme') || 'light';
  applyTheme(saved);

  const btn = qs('#themeToggle');
  if(!btn) return;

  const setIcon = (t) => {
    btn.textContent = t === 'dark' ? '☀️' : '🌙';
  };
  setIcon(saved);

  btn.addEventListener('click', ()=>{
    const nowDark = !document.body.classList.contains('dark');
    const newTheme = nowDark ? 'dark' : 'light';
    applyTheme(newTheme);
    localStorage.setItem('dt-theme', newTheme);
    setIcon(newTheme);
  });
}


/* HAMBURGER */
function initHamburger() {
  const ham = qs('#hamburger');
  const menu = qs('#menu');
  if (!ham || !menu) return;
  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    if (menu.style.display === 'flex') menu.style.display = 'none';
    else {
      menu.style.display = 'flex';
    }
  });
}

/* CLOUD PARALLAX + TERBANG (random kiri/kanan) */
function initClouds() {
  const layer = qs('#cloudLayer');
  if (!layer) return;

  const spriteSrcs = [
    'img/cloud-1.png','img/cloud-2.png','img/cloud-3.png',
    'img/cloud-4.png','img/cloud-5.png'
  ];

  function spawnCloud() {
    const img = document.createElement('img');
    img.className = 'hero-cloud';
    img.alt = 'Cloud';
    img.src = spriteSrcs[Math.floor(Math.random() * spriteSrcs.length)];

    const size = 80 + Math.random() * 80;        // 80–160 px
    img.style.width = size + 'px';

    // mulai dari luar layar (kiri atau kanan)
    const fromLeft = Math.random() < 0.5 ? -220 : window.innerWidth + 220;
    const toLeft   = fromLeft < 0 ? window.innerWidth + 260 : -260;

    const topPercent = 8 + Math.random() * 65;   // 8%–73% tinggi hero
    img.style.top  = topPercent + '%';
    img.style.left = fromLeft + 'px';

    layer.appendChild(img);

    const duration = 22000 + Math.random() * 15000; // 22–37 detik

    img.animate(
      [
        { transform: 'translateX(0px)' },
        { transform: `translateX(${toLeft - fromLeft}px)` }
      ],
      {
        duration,
        easing: 'linear'
      }
    ).onfinish = () => img.remove();
  }

  // awal: spawn beberapa awan sekaligus
  for (let i = 0; i < 12; i++) spawnCloud();
  // lalu spawn terus tiap 1.8 detik
  setInterval(spawnCloud, 1800);
}

/* DATA EVENT (HOME > EVENT TAB) */
function fmt(d){
  return new Date(d).toLocaleDateString('id-ID',{
    day:'2-digit',month:'short',year:'numeric'
  });
}

const EVENTS = [
  {
    id:'lv',
    title:'Last Voyage — Graduation Show Shania Indira',
    date:'2024-04-27',
    place:'Tennis Indoor Senayan',
    cover:'img/last-voyage_bg.jpg',
    link:'rundown/last-voyage.html',
    published: '2024-04-27'   // TANGGAL NEWS PENGUMUMAN DIUPLOAD
  },
  {
    id:'bsd1',
    title:'BSD Vol. 1 — Spring Has Come',
    date:'2024-05-11',
    place:'ICE BSD',
    cover:'img/shc_bg.jpg',
    link:'rundown/bsd-vol1.html',
    published: '2024-05-11'   // TANGGAL NEWS PENGUMUMAN DIUPLOAD
  },
  {
    id:'bsd2',
    title:'BSD Vol. 2 — Road to SSK',
    date:'2024-09-27',
    place:'ICE BSD',
    cover:'img/rts_bg.jpg',
    link:'rundown/bsd-vol2.html',
    published: '2024-05-11'   // TANGGAL NEWS PENGUMUMAN DIUPLOAD
  },
  {
    id:'anniv13',
    title:'Indonesia Arena — Anniversary 13 JKT48',
    date:'2024-12-14',
    place:'Indonesia Arena',
    cover:'img/wonderland_bg.jpg',
    link:'rundown/anniv-13.html',
    published: '2024-12-14'   // TANGGAL NEWS PENGUMUMAN DIUPLOAD
  },
  {
    id:'bsd4',
    title:'BSD Vol. 4 — Sister Reunion',
    date:'2025-10-24',
    place:'BSD',
    cover:'img/sisterreunion_bg.jpg',
    link:'rundown/bsd-vol4.html',
    published: '2025-10-24'   // TANGGAL NEWS PENGUMUMAN DIUPLOAD
  },
  {
    id:'bsd3',
    title:'BSD Vol. 3 — Meet & Greet Event 26th Single',
    date:'2025-02-08',
    place:'BSD',
    cover:'img/sukinanda_bg.jpg',
    link:'rundown/bsd-vol3.html',
    published: '2025-02-08'   // TANGGAL NEWS PENGUMUMAN DIUPLOAD
  },
  {
    id:'fullhouse',
    title:'Full House — Setlist Original Concert',
    date:'2025-03-01',
    place:'Istora Senayan',
    cover:'img/fullhouse_bg.jpg',
    link:'rundown/full-house.html',
    published: '2025-03-01'   // TANGGAL NEWS PENGUMUMAN DIUPLOAD
  }
];

/* RENDER EVENT ARCHIVE */
function initEvents(){
  const grid   = qs('#eventGrid');
  const search = qs('#searchEvent');
  const yearSel= qs('#filterYear');
  if (!grid || !search || !yearSel) return;

  // year options
  const years = [...new Set(EVENTS.map(e => new Date(e.date).getFullYear()))]
    .sort((a,b)=>b-a);
  years.forEach(y=>{
    const o=document.createElement('option');
    o.value=y;o.textContent=y;
    yearSel.appendChild(o);
  });

  function render() {
    const term = (search.value || '').toLowerCase();
    const y    = yearSel.value;
    grid.innerHTML = '';

    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);

    EVENTS
      .filter(e => !y || new Date(e.date).getFullYear() == y)
      .filter(e =>
        e.title.toLowerCase().includes(term) ||
        e.place.toLowerCase().includes(term)
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach(e => {
        const card = document.createElement('a');
        card.className = 'card event-card';
        card.href = e.link;
        card.target = '_blank';
        card.rel = 'noopener';

        const bg = e.cover ? `style="background-image:url('${e.cover}')"` : '';

        const eventDate = new Date(e.date);
        const isUpcoming = eventDate >= todayMid;

        const statusLabel = isUpcoming ? 'Upcoming' : 'Finished';
        const statusClass = isUpcoming
          ? 'event-status-upcoming'
          : 'event-status-past';

        const badgeHtml = `
          <span class="event-status-badge ${statusClass}">
            ${statusLabel}
          </span>
        `;

        card.innerHTML = `
          <div class="thumb" ${bg}>
            ${badgeHtml}
          </div>
          <div class="body">
            <div class="eyebrow">${fmt(e.date)} • ${e.place}</div>
            <div class="title">${e.title}</div>
            <p class="desc">Klik untuk membuka rundown.</p>
          </div>
        `;
        grid.appendChild(card);
      });
  }

  search.addEventListener('input',render);
  yearSel.addEventListener('change',render);
  render();
}

/* GALERI DATA + HELPERS */
function buildSeq(folder,prefix,from,to,pad2=false){
  const arr=[];
  for(let i=from;i<=to;i++){
    const n=pad2?String(i).padStart(2,'0'):i;
    arr.push(`${folder}/${prefix}${n}.jpg`);
  }
  return arr;
}

const GALLERIES = [
  {
    id: 'bsd-vol1',
    date: '2024-05-11',
    title: 'BSD Vol. 1 — Spring Has Come',
    cover: 'img/shc_bg.jpg',
    photos: buildSeq('img/gallery/bsd-vol1','bsd1-',1,11,true)
  },
  {
    id: 'bsd-vol2',
    date: '2024-09-27',
    title: 'BSD Vol. 2 — Road to SSK',
    cover: 'img/rts_bg.jpg',
    photos: buildSeq('img/gallery/bsd-vol2','bsd2-',1,21,true)
  },
  {
    id: 'bsd-vol3',
    date: '2025-02-08',
    title: 'BSD Vol. 3 — MT MNG / 2S',
    cover: 'img/sukinanda_bg.jpg',
    photos: buildSeq('img/gallery/bsd-vol3','bsd3-',1,24,true)
  },
  {
    id: 'bsd-vol4',
    date: '2025-10-24',
    title: 'BSD Vol. 4 — Sister Reunion',
    cover: 'img/sisterreunion_bg.jpg',
    photos: buildSeq('img/gallery/bsd-vol4','bsd4-',1,13,true)
  },
  {
    id: 'last-voyage',
    date: '2024-04-27',
    title:'Last Voyage — Graduation Ci Shani',
    cover:'img/last-voyage_bg.jpg',
    photos:buildSeq('img/gallery/last-voyage','lastvoyage',1,11,false)
  },
  {
    id:'anniv13',
    date: '2024-12-14',
    title:'Indonesia Arena — Anniversary JKT48',
    cover:'img/wonderland_bg.jpg',
    photos:buildSeq('img/gallery/anniv13','anniv13-',1,18,false)
  },
  {
    id:'full-house',
    date: '2025-03-01',
    title:'Full House — Istora Senayan',
    cover:'img/fullhouse_bg.jpg',
    photos:buildSeq('img/gallery/full-house','fullhouse',1,13,false)
  }
];


/* RENDER GALERI LIST (di tab Galeri Seram) */
function initGalleryList(){
  const grid = qs('#galleryGrid');
  if (!grid) return;
  grid.innerHTML = '';

  // urutkan dari tanggal terbaru ke terlama
  const sorted = [...GALLERIES].sort((a, b) => {
    const da = a.date ? new Date(a.date) : new Date(0);
    const db = b.date ? new Date(b.date) : new Date(0);
    return db - da; // newest first
  });

  sorted.forEach((g, idx) => {
    const a = document.createElement('a');
    a.className = 'gallery-card';
    a.href = `galeri-event.html?id=${g.id}`;

    const photoCount = g.photos ? g.photos.length : 0;
    const dateLabel  = g.date ? fmt(g.date) : '';
    const isNewest   = idx === 0;   // kartu pertama = paling baru

    const meta = dateLabel
      ? `${dateLabel} • ${photoCount} foto`
      : `${photoCount} foto`;

    a.innerHTML = `
      <div class="thumb" style="background-image:url('${g.cover}')">
        ${isNewest ? '<span class="gallery-badge-new">NEW</span>' : ''}
      </div>
      <div class="body">
        <div class="eyebrow">${meta}</div>
        <div class="title">${g.title}</div>
        <p class="desc">Klik untuk melihat galeri foto.</p>
      </div>
    `;

    grid.appendChild(a);
  });
}

/* LAZY OBSERVER UNTUK GALERI EVENT */
let galleryLazyObserver = null;

if ('IntersectionObserver' in window) {
  galleryLazyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const img = entry.target;
      const realSrc = img.dataset.src;
      if (realSrc) {
        img.src = realSrc;
      }

      // kalau sudah load, kasih class "loaded" buat efek fade-in
      img.onload = () => img.classList.add('loaded');

      galleryLazyObserver.unobserve(img);
    });
  }, {
    threshold: 0.2
  });
}

/* GALERI-EVENT (dipanggil dari galeri-event.html) */
function renderGalleryEvent() {
  const params = new URLSearchParams(location.search);
  const id     = params.get('id');
  const g      = GALLERIES.find(x => x.id === id);
  if (!g) return;

  const head    = qs('#eventGalleryHeader');
  const box     = qs('#eventGalleryPhotos');
  const crumb   = qs('#eventBreadcrumb');
  const loadBtn = qs('#galleryLoadMore');    // tombol "Lihat foto lainnya"

  if (!head || !box) return;

  /* ============================
     META: DATE + PHOTO COUNT
  ============================ */
  const dateLabel   = g.date ? fmt(g.date) : '';
  const totalPhotos = g.photos.length;

  head.innerHTML = `
    <h1>${g.title}</h1>
    <p class="event-gallery-meta">
      ${dateLabel ? `${dateLabel} • ` : ''}${totalPhotos} foto
    </p>
  `;

  // breadcrumb
  if (crumb) {
    crumb.textContent = ` / ${g.title}`;
  }

  // reset foto
  box.innerHTML = '';

  /* ============================
     SISTEM LOAD PER BATCH
  ============================ */
  const BATCH = 12;
  let index = 0;

  function loadBatch() {
    const slice = g.photos.slice(index, index + BATCH);

    slice.forEach((src) => {
      const img = document.createElement('img');
      img.alt = g.title;
      img.classList.add('lazy-img');

      // lazy load (IntersectionObserver)
      if (typeof galleryLazyObserver !== 'undefined' && galleryLazyObserver) {
        img.dataset.src = src;
        galleryLazyObserver.observe(img);
      } else {
        img.src = src;
        img.classList.add('loaded');
      }

      // klik → buka lightbox
      img.addEventListener('click', () => {
        const fullSrc = img.src || img.dataset.src || src;
        openLightbox(fullSrc);
      });

      box.appendChild(img);
    });

    index += slice.length;

    // kontrol tombol load more
    if (loadBtn) {
      if (index < g.photos.length) {
        loadBtn.style.display = 'inline-flex';
      } else {
        loadBtn.style.display = 'none';
      }
    }
  }

  // load pertama
  loadBatch();

  if (loadBtn) {
    loadBtn.onclick = () => loadBatch();
  }
}



/* LIGHTBOX (dipakai di galeri-event) */
function openLightbox(src){
  const lb=qs('#lightbox'), img=qs('#lightboxImg');
  if(!lb||!img) return;
  img.src=src;
  lb.style.display='flex';
}
function closeLightbox(){
  const lb=qs('#lightbox');
  if(lb) lb.style.display='none';
}

// Tutup lightbox lewat ESC
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
  }
});

/* =========================
   NEWS DATA + HELPERS
========================= */

const NEWS_ITEMS = [
  // NEWS 1 – Pengumuman Official Website
  {
    id: 'news-site-launch',
    date: '2025-11-21',
    category: 'info',
    badge: 'Info',
    title: 'DombaTerbang Hub Resmi Mengudara',
    summary:
      'Website resmi DombaTerbang Hub akhirnya online! Mulai sekarang semua info event, rundown, galeri foto, dan update DombaTerbang Super League dikumpulkan di satu tempat.',
    link: 'news-detail.html?id=news-site-launch',
    linkLabel: 'Detail pengumuman',
    thumbDesktop: 'img/news/news-site-launch-desktop.png',
    thumbMobile:  'img/news/news-site-launch-mobile.png',
    cover: 'img/news/dthub-launch.png',

    content: `
      <p>
        Selamat datang di <strong>DombaTerbang Hub</strong>! 🎉<br>
        Setelah sekian lama numpang di berbagai link dan dokumen terpisah,
        akhirnya DombaTerbang punya rumah resmi untuk semua kegiatan dan arsipnya.
      </p>

      <p>Lewat website ini kamu bisa dengan mudah menemukan:</p>
      <ul>
        <li><strong>Event Archive (Rundown):</strong> rangkuman acara, jadwal, rundown, dan info venue.</li>
        <li><strong>Galeri Seram:</strong> koleksi foto dan momen favorit dari setiap event DombaTerbang.</li>
        <li><strong>DombaTerbang Super League (DTSL):</strong> liga foto mingguan lengkap dengan klasemen, rekap poin, dan pemenang tiap minggu.</li>
        <li><strong>News &amp; Updates:</strong> pengumuman terbaru seputar event, project, dan update fitur website.</li>
      </ul>
      <p>
        Terima kasih sudah mampir dan ikut meramaikan DombaTerbang sampai sejauh ini.
        Semoga <strong>DombaTerbang Hub</strong> bisa jadi tempat nyaman. Dan mohon dukungannya selalu.🐑✨
      </p>
    `
  },

  // NEWS 2 – Pengumuman DombaTerbang Super League
  {
    id: 'news-dtsl-announce',
    date: '2025-11-22',
    category: 'league',
    badge: 'DTSL League',
    title: 'Perkenalan DombaTerbang Super League (DTSL)',
    summary:
      'DombaTerbang Super League (DTSL) adalah liga foto mingguan antar oshimen DombaTerbang, lengkap dengan sistem poin, klasemen musim, dan rekap pemenang tiap minggu.',
    link: 'news-detail.html?id=news-dtsl-announce',
    linkLabel: 'Detail pengumuman',
    thumbDesktop: 'img/news/dtsl-thumb-desktop.png',
    thumbMobile:  'img/news/dtsl-thumb-mobile.png',
    cover: 'img/news/dtsl-announce.png',

    content: `
      <p>
        <strong>DombaTerbang Super League (DTSL)</strong> adalah liga foto mingguan
        yang dibuat khusus untuk seru-seruan bareng keluarga DombaTerbang.
        Setiap pekan akan ada foto yang di-vote, poin yang bergerak, dan klasemen yang terus berubah.
      </p>

      <h3>Apa itu DTSL?</h3>
      <p>
        DTSL adalah kompetisi foto mingguan antara beberapa member pilihan.
        Setiap minggu para member mengirimkan satu foto terbaiknya, lalu DombaTerbang
        memberikan vote. Hasil vote tersebut akan dikonversi menjadi poin liga.
      </p>

      <h3>Gambaran sistem liga</h3>
      <ul>
        <li><strong>Format Liga menggunakan</strong> Season dengan durasi 3 bulan.</li>
        <li><strong>Matchday mingguan:</strong> tiap minggu ada satu ronde voting foto.</li>
        <li><strong>Poin:</strong> juara 1, 2, dan 3 tiap minggu akan mendapat poin berbeda sesuai posisi.</li>
        <li><strong>Klasemen:</strong> total poin diakumulasi sepanjang satu season dan ditampilkan di halaman khusus DTSL.</li>
        <li><strong>Highlight:</strong> foto pemenang mingguan + caption dan info singkatnya muncul sebagai “Winning Photo”.</li>
      </ul>

      <h3>Fitur fitur DTSL?</h3>
      <ul>
        <li>Klasemen lengkap per member untuk tiap season.</li>
        <li>Rekap hasil per minggu, termasuk siapa juara 1–2–3 dan berapa poin yang didapat.</li>
        <li>Foto dan caption pemenang mingguan dalam tampilan “Winning Photo”.</li>
      </ul>

      <p>
        DTSL dibuat bukan hanya sebagai ajang kompetisi, tapi juga sebagai cara
        mengabadikan momen seru dan perkembangan setiap member lewat foto.
        Silakan cek halaman liga untuk melihat klasemen terbaru, hasil minggu sebelumnya,
        dan siapa yang lagi panas form-nya musim ini. 🏆
      </p>
    `
  }
];


// helper format tanggal singkat
function fmtNewsDate(d) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',   // ✅ ganti dari 'MMM' ke 'short'
    year: 'numeric'
  });
}

// =========================
//  RENDER HALAMAN NEWS DETAIL
// =========================
function renderNewsDetail() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) return;

  // cari item news berdasarkan id
  const item = NEWS_ITEMS.find(n => n.id === id);
  if (!item) return;

  const titleEl = qs('#newsDetailTitle');
  const dateEl  = qs('#newsDetailDate');
  const badgeEl = qs('#newsDetailBadge');
  const bodyEl  = qs('#newsDetailBody');
  const coverEl = qs('#newsDetailCover');

  // isi judul & meta
  if (titleEl) titleEl.textContent = item.title;
  if (dateEl)  dateEl.textContent  = fmtNewsDate(item.date);

  if (badgeEl) {
    badgeEl.textContent = item.badge;
    badgeEl.className = `news-detail-badge news-detail-badge-${item.category}`;
  }

  // cover (optional)
  if (coverEl) {
    if (item.cover) {
      coverEl.style.backgroundImage = `url('${item.cover}')`;
    } else {
      coverEl.style.display = 'none';
    }
  }

  // isi body dari field `content` di NEWS_ITEMS
  if (bodyEl && item.content) {
    bodyEl.innerHTML = item.content;   // sudah berupa HTML siap pakai
  }
}


/* =========================
   NEWS RENDER + PAGINATION
========================= */

let newsFilter = 'all';
let newsPage   = 1;
const NEWS_PER_PAGE = 8;

function getFilteredNews() {
  const items = [...NEWS_ITEMS].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  if (newsFilter === 'all') return items;
  return items.filter((n) => n.category === newsFilter);
}

function renderNewsList() {
  const listEl = qs('#newsList');
  const pagEl  = qs('#newsPagination');
  if (!listEl || !pagEl) return;

  const allItems   = getFilteredNews();
  const total      = allItems.length;
  const totalPages = Math.max(1, Math.ceil(total / NEWS_PER_PAGE));

  if (newsPage > totalPages) newsPage = totalPages;

  const start = (newsPage - 1) * NEWS_PER_PAGE;
  const slice = allItems.slice(start, start + NEWS_PER_PAGE);

  // render LIST NEWS
  listEl.innerHTML = '';

  if (!slice.length) {
    listEl.innerHTML =
      '<div class="news-empty">Belum ada berita untuk kategori ini.</div>';
  } else {
    slice.forEach((n) => {
      const isExternal = n.link.startsWith('http') || n.link.startsWith('liga/');
      const targetAttr = isExternal ? ' target="_blank" rel="noopener"' : '';

      const thumbDesktop = n.thumbDesktop || 'img/news/default-desktop.jpg';
      const thumbMobile  = n.thumbMobile  || thumbDesktop;

      listEl.insertAdjacentHTML(
        'beforeend',
        `
        <article class="news-item">
          <div class="news-item-main">
            <div class="news-thumb">
              <picture>
                <source media="(max-width: 640px)" srcset="${thumbMobile}">
                <img src="${thumbDesktop}" alt="${n.title}" loading="lazy">
              </picture>
            </div>

            <div class="news-item-body">
              <div class="news-badge-row">
                <span class="news-badge news-badge-${n.category}">
                  ${n.badge}
                </span>
                <span class="news-date">${fmtNewsDate(n.date)}</span>
              </div>

              <a href="${n.link}" class="news-title-link"${targetAttr}>
                <h3 class="news-item-title">${n.title}</h3>
              </a>

              <p class="news-item-summary">${n.summary}</p>

              <a href="${n.link}" class="news-more"${targetAttr}>
                ${n.linkLabel || 'Lihat detail →'}
              </a>
            </div>
          </div>
        </article>
        `
      );
    });
  }

  // ===========================
  //      SMART PAGINATION
  // ===========================
  pagEl.innerHTML = '';
  if (totalPages <= 1) return;

  let html = '';

  function addPageBtn(p, label) {
    const text = label || p;
    const active = (p === newsPage) ? ' active' : '';
    html += `<button class="news-page-btn${active}" data-page="${p}">${text}</button>`;
  }

  function addEllipsis() {
    html += `<span class="news-page-ellipsis">…</span>`;
  }

  const firstPage = 1;
  const lastPage  = totalPages;
  const windowSize = 1;

  // Prev
  if (newsPage > 1) {
    addPageBtn(newsPage - 1, '‹ Prev');
  }

  // Always show page 1
  addPageBtn(firstPage);

  // Calculate window
  let wStart = Math.max(newsPage - windowSize, firstPage + 1);
  let wEnd   = Math.min(newsPage + windowSize, lastPage - 1);

  // near left
  if (newsPage <= firstPage + windowSize) {
    wEnd = Math.min(firstPage + windowSize * 2, lastPage - 1);
  }

  // near right
  if (newsPage >= lastPage - windowSize) {
    wStart = Math.max(lastPage - windowSize * 2, firstPage + 1);
  }

  // Ellipsis after 1
  if (wStart > firstPage + 1) {
    addEllipsis();
  }

  // middle pages
  for (let p = wStart; p <= wEnd; p++) {
    addPageBtn(p);
  }

  // Ellipsis before last
  if (wEnd < lastPage - 1) {
    addEllipsis();
  }

  // Always show last page (if >1)
  if (lastPage > firstPage) {
    addPageBtn(lastPage);
  }

  // Next
  if (newsPage < totalPages) {
    addPageBtn(newsPage + 1, 'Next ›');
  }

  pagEl.innerHTML = html;
}


function initNews() {
  const chips = qsa('.news-filter-chip');
  const pagEl = qs('#newsPagination');

  // klik filter kategori (All / Event / DTSL League / Gallery / Info)
  if (chips.length) {
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');

        newsFilter = chip.dataset.newsFilter || 'all';
        newsPage   = 1;
        renderNewsList();

        // smooth scroll ke bagian News
        const newsSection = qs('#news');
        if (newsSection) {
          const y = newsSection.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    });
  }

  // klik pagination (Prev / Next / nomor halaman)
  if (pagEl) {
    pagEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.news-page-btn');
      if (!btn) return;

      const page = parseInt(btn.dataset.page, 10);
      if (!page || page === newsPage) return;

      newsPage = page;
      renderNewsList();

      // smooth scroll ke atas section News
      const newsSection = qs('#news');
      if (newsSection) {
        const y = newsSection.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  }

  // pertama kali load list news
  renderNewsList();
}


/* =========================
   NEWS DETAIL PAGE RENDER
========================= */

function initNewsDetail() {
  const shell = qs('#newsDetailShell');
  if (!shell) return;

  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  const item = NEWS_ITEMS.find(n => n.id === id);
  const detail = NEWS_DETAIL[id];

  if (!item) {
    shell.innerHTML = `
      <div class="news-detail-empty">
        <h1>Berita tidak ditemukan</h1>
        <p>Link yang kamu buka mungkin sudah tidak valid.</p>
        <p><a href="index.html#news" class="news-detail-back">← Kembali ke halaman News</a></p>
      </div>
    `;
    return;
  }

  const catClass = `news-badge-${item.category || 'info'}`;

  const coverHtml = detail && detail.cover
    ? `<div class="news-detail-cover" style="background-image:url('${detail.cover}')"></div>`
    : '';

  const bodyHtml = detail && detail.body
    ? detail.body
    : `<p>${item.summary}</p>`;

  shell.innerHTML = `
    <a href="index.html#news" class="news-detail-back">← Kembali ke halaman News</a>

    <article class="news-detail-article">
      <header class="news-detail-header">
        <div class="news-detail-top">
          <span class="news-badge ${catClass}">${item.badge}</span>
          <span class="news-detail-date">${fmtNewsDate(item.date)}</span>
        </div>
        <h1 class="news-detail-title">${item.title}</h1>
      </header>

      ${coverHtml}

      <div class="news-detail-body">
        ${bodyHtml}
      </div>
    </article>
  `;
}


/* =========================
   HOME SHORTCUTS
========================= */

function initHomeShortcuts() {
  const wrap = qs('.home-shortcuts');
  if (!wrap) return;

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.home-shortcut-btn');
    if (!btn) return;

    const type = btn.dataset.shortcut;

    // buka liga di tab baru
    if (type === 'liga') {
      window.open('liga/liga.html', '_blank', 'noopener');
      return;
    }

    // pindah tab internal (home/news/event/gallery/about)
    if (['home', 'news', 'event', 'gallery', 'about'].includes(type)) {
      showSection(type);

      // sync dengan navbar
      const navLink = qs(`.menu a[data-target="${type}"]`);
      if (navLink) {
        qsa('.menu a').forEach(a =>
          a.classList.toggle('active', a === navLink)
        );
      }

      // scroll ke atas dikit supaya kelihatan judul
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  });
}

/* =========================
   BACK TO TOP BUTTON
========================= */
function initBackToTop() {
  const btn = qs('#backToTop');
  if (!btn) return;

  const toggle = () => {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  };

  window.addEventListener('scroll', toggle);
  toggle(); // cek posisi awal

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* =========================
   HOME HIGHLIGHT SECTION
========================= */
function initHomeHighlights() {
  const nextEl = qs('#homeNextEvent');
  const newsEl = qs('#homeLatestNews');
  const ligaEl = qs('#homeLigaHighlight');
  if (!nextEl || !newsEl || !ligaEl) return;

  const today = new Date();

  // --- NEXT EVENT (pakai tanggal event + published) ---
  const upcoming = [...EVENTS]
    .filter(e => {
      const eventDate = new Date(e.date);
      if (isNaN(eventDate)) return false;

      // kalau ada published, cek dulu
      if (e.published) {
        const pubDate = new Date(e.published);
        if (!isNaN(pubDate) && pubDate > today) {
          // belum saatnya diumumin
          return false;
        }
      }

      // hanya event yang belum lewat
      return eventDate >= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  if (upcoming) {
    nextEl.innerHTML = `
      <div class="home-card-pill">Next Event</div>
      <h3 class="home-card-title">${upcoming.title}</h3>
      <p class="home-card-text">
        ${fmt(upcoming.date)} • ${upcoming.place}
      </p>
      <a href="${upcoming.link}" class="home-card-link" target="_blank" rel="noopener">
        Buka rundown event
      </a>
    `;
  } else {
    nextEl.innerHTML = `
      <div class="home-card-pill">Next Event</div>
      <h3 class="home-card-title">Belum ada event terjadwal</h3>
      <p class="home-card-text">
        Tunggu info event baru di tab <b>News</b> &amp; <b>Event</b>.
      </p>
    `;
  }

  // --- LATEST NEWS (card ke-2) ---
  if (NEWS_ITEMS && NEWS_ITEMS.length) {
    const latest = [...NEWS_ITEMS].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )[0];

    const catLabel =
      latest.category === 'event'   ? 'Event' :
      latest.category === 'gallery' ? 'Gallery' :
      latest.category === 'info'    ? 'Info' :
      'DTSL League';

    newsEl.innerHTML = `
      <div class="home-card-pill">${catLabel}</div>
      <h3 class="home-card-title">${latest.title}</h3>
      <p class="home-card-text">
        ${fmtNewsDate(latest.date)} — ${latest.summary}
      </p>
      <a href="${latest.link}" class="home-card-link">
        Baca selengkapnya
      </a>
    `;
  } else {
    newsEl.innerHTML = `
      <div class="home-card-pill">News</div>
      <h3 class="home-card-title">Belum ada berita</h3>
      <p class="home-card-text">
        Nanti kalau ada pengumuman baru bakal muncul di sini.
      </p>
    `;
  }

  // --- Liga (card ke-3) tetap shortcut ke DTSL ---
  ligaEl.innerHTML = `
    <div class="home-card-pill">Liga</div>
    <h3 class="home-card-title">DombaTerbang Super League</h3>
    <p class="home-card-text">
      Lihat klasemen lengkap, hasil tiap minggu, dan foto pemenang DTSL Season 1 &amp; 2.
    </p>
    <a href="liga/liga.html" class="home-card-link" target="_blank" rel="noopener">
      Buka halaman liga
    </a>
  `;
}


  // konten detail per berita
const NEWS_DETAIL = {
  'news-dtsl-archive': {
    cover: 'img/news/dtsl-archive.jpg', // opsional, kalau belum ada boleh kosong / nanti diganti
    body: `
      <p>
        DombaTerbang Super League Season 1 resmi ditutup dengan penuh drama & tawa.
        Selama beberapa minggu, anggota DombaTerbang saling adu foto terbaik setiap Kamis,
        dengan sistem poin yang mengacu pada voting internal.
      </p>
      <p>
        Di halaman liga, kamu bisa lihat:
      </p>
      <ul>
        <li>Klasemen akhir Season 1</li>
        <li>Rekap hasil per minggu</li>
        <li>Head to head antar member</li>
        <li>Foto-foto pemenang tiap matchday</li>
      </ul>
      <p>
        Klik tombol di bawah untuk langsung menuju halaman liga DTSL.
      </p>
      <p>
        <a href="liga/liga.html" target="_blank" rel="noopener">
          🏆 Buka halaman DTSL Season 1
        </a>
      </p>
    `
  },

  'news-dtsl-s2': {
    cover: 'img/news/dtsl-s2.jpg',
    body: `
      <p>
        Setelah keberhasilan Season 1, DombaTerbang Super League akan lanjut ke
        <strong>Season 2</strong> yang rencananya berlangsung sekitar
        <strong>Jan–Mar 2026</strong>.
      </p>
      <p>
        Format pertandingan, jumlah peserta, serta jadwal lengkap matchday
        akan diumumkan setelah internal DombaTerbang melakukan finalisasi sistem poin
        dan teknis voting.
      </p>
      <p>
        Rencananya Season 2 akan membawa:
      </p>
      <ul>
        <li>Format liga yang lebih stabil</li>
        <li>Visual recap mingguan yang lebih rapi</li>
        <li>Integrasi penuh dengan halaman DTSL di website</li>
      </ul>
      <p>
        Stay tuned di halaman liga untuk update berikutnya.
      </p>
    `
  },

  'news-gallery-bsd4': {
    cover: 'img/sisterreunion_bg.jpg',
    body: `
      <p>
        Galeri Seram untuk <strong>BSD Vol. 4 — Sister Reunion</strong> sudah
        resmi ditambahkan. Kamu bisa nostalgia lagi dengan momen-momen absurd,
        wholesome, dan sedikit chaos bareng DombaTerbang.
      </p>
      <p>
        Beberapa highlight di galeri:
      </p>
      <ul>
        <li>Foto-foto candid sebelum dan sesudah event</li>
        <li>Pose bareng circle dan member</li>
        <li>Kilas balik suasana venue & perjalanan</li>
      </ul>
      <p>
        Klik tombol di bawah untuk langsung ke galeri BSD Vol. 4.
      </p>
      <p>
        <a href="galeri-event.html?id=bsd-vol4">
          📷 Buka Galeri BSD Vol. 4
        </a>
      </p>
    `
  },

  'news-site-darkmode': {
    cover: 'img/wonderland_bg.jpg',
    body: `
      <p>
        Website <strong>DombaTerbang Hub</strong> hadir dengan tampilan baru ✨.
      </p>
      <ul>
        <li><strong>Dark mode</strong> dengan nuansa langit malam</li>
        <li><strong>Preloader logo</strong> yang muter ala loading idol site</li>
        <li><strong>Halaman liga DTSL</strong> yang terintegrasi sebagai pintu masuk utama</li>
      </ul>
      <p>
        Semua ini dibuat supaya DombaTerbang punya satu portal kenangan yang nyaman
        dipakai jangka panjang, baik untuk rundown, galeri seram, maupun liga internal.
      </p>
    `
  },

  'news-next-event': {
    cover: '',
    body: `
      <p>
        Event offline berikutnya dari DombaTerbang masih dalam tahap persiapan.
        Venue, konsep, dan rundown belum diumumkan secara resmi.
      </p>
      <p>
        Begitu fixed, info lengkap akan muncul di:
      </p>
      <ul>
        <li>Halaman <strong>News</strong> untuk pengumuman utama</li>
        <li>Tab <strong>Event</strong> untuk rundown & detail teknis</li>
        <li>Mungkin juga teaser di sosial media circle</li>
      </ul>
      <p>
        Untuk sementara, kamu bisa nostalgia dulu lewat event archive dan galeri seram
        yang sudah ada di website ini.
      </p>
    `
  }
};

/* INIT MAIN PAGE */
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHamburger();
  initNavScroll();

  const isNewsDetail   = document.body.classList.contains('news-detail-page');
  const isGalleryEvent = document.body.classList.contains('gallery-event-page');

  if (isNewsDetail) {
    // Halaman detail news
    renderNewsDetail();
  } else if (isGalleryEvent) {
    // Halaman galeri per event
    renderGalleryEvent();
    initBackToTop();
  } else {
    // Halaman utama (index) – pakai sistem tab SPA
    initNav();
    initClouds();
    initEvents();
    initGalleryList();
    initNews();
    initHomeHighlights();

    const hash = location.hash.replace('#','');
    if (['home','news','event','gallery','about'].includes(hash)) {
      showSection(hash);
    } else {
      showSection('home');
    }
  }
});


// SEMBUNYIKAN PRELOADER SETELAH HALAMAN SIAP
window.addEventListener('load', ()=>{
  const pre = qs('#preloader');
  if(!pre) return;
  setTimeout(()=>{
    pre.classList.add('hidden');
  }, 2000);
});
