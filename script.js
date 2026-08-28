(async function () {
  const filtersEl = document.getElementById('filters');
  const feedEl = document.getElementById('feed');

  let categories = [];
  let posts = [];
  let activeCategory = 'all';

  function categoryById(id) {
    return categories.find(function (c) { return c.id === id; });
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).format(d);
    } catch (e) {
      return '';
    }
  }

  function renderFilters() {
    filtersEl.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'filter-pill' + (activeCategory === 'all' ? ' active' : '');
    allBtn.textContent = 'Tümü';
    allBtn.addEventListener('click', function () { setActive('all'); });
    filtersEl.appendChild(allBtn);

    categories.forEach(function (cat) {
      const btn = document.createElement('button');
      btn.className = 'filter-pill' + (activeCategory === cat.id ? ' active' : '');
      btn.style.setProperty('--pill-color', cat.color);
      btn.textContent = cat.label;
      btn.addEventListener('click', function () { setActive(cat.id); });
      filtersEl.appendChild(btn);
    });
  }

  function setActive(id) {
    activeCategory = id;
    renderFilters();
    renderFeed();
  }

  function renderFeed() {
    const visible = posts
      .filter(function (p) { return activeCategory === 'all' || p.category === activeCategory; })
      .sort(function (a, b) { return new Date(b.publishedAt) - new Date(a.publishedAt); });

    feedEl.innerHTML = '';

    if (visible.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Bu kategoride henüz içerik yok.';
      feedEl.appendChild(empty);
      return;
    }

    visible.forEach(function (post) {
      const cat = categoryById(post.category);
      const color = cat ? cat.color : null;
      const label = cat ? cat.label : post.category;

      const card = document.createElement('article');
      card.className = 'card';
      if (color) card.style.setProperty('--card-color', color);

      const meta = document.createElement('div');
      meta.className = 'card-meta';
      meta.innerHTML =
        '<span>' + label + '</span><span class="dot">&middot;</span><span>' + formatDate(post.publishedAt) + '</span>';
      card.appendChild(meta);

      const title = document.createElement('h2');
      title.className = 'card-title';
      title.textContent = post.title;
      card.appendChild(title);

      if (post.summary) {
        const summary = document.createElement('p');
        summary.className = 'card-summary';
        summary.textContent = post.summary;
        card.appendChild(summary);
      }

      if (post.sourceUrl) {
        const source = document.createElement('p');
        source.className = 'card-source';
        const a = document.createElement('a');
        a.href = post.sourceUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = 'Kaynak: ' + (post.sourceName || 'bağlantı') + ' ↗';
        source.appendChild(a);
        card.appendChild(source);
      }

      feedEl.appendChild(card);
    });
  }

  try {
    const [catRes, postRes] = await Promise.all([
      fetch('data/categories.json'),
      fetch('data/posts.json')
    ]);
    categories = await catRes.json();
    posts = await postRes.json();
  } catch (e) {
    feedEl.innerHTML = '<div class="empty-state">İçerikler yüklenemedi.</div>';
    return;
  }

  renderFilters();
  renderFeed();
})();
