async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Falha ao carregar ${path}`);
  return res.json();
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  } catch {
    return iso || '';
  }
}

function timeAgo(iso) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} minutes ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
  } catch {
    return '';
  }
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function el(html) {
  const div = document.createElement('div');
  div.innerHTML = html.trim();
  return div.firstElementChild;
}

const CABRAL_REPO_ROOT = 'https://github.com/GabrielCabral380/CABRAL';
const CABRAL_TREE_ROOT = `${CABRAL_REPO_ROOT}/tree/main/data/mirror/repos`;
const CABRAL_GITHUB_ROOT = 'https://github.com/GabrielCabral380';

function slug(text) {
  return (text || '').toLowerCase();
}

function repoKey(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function buildRepoLink(repoName) {
  return repoName ? `${CABRAL_GITHUB_ROOT}/${encodeURIComponent(repoName)}` : CABRAL_GITHUB_ROOT;
}

function detectTags(repo) {
  const base = `${repo.name} ${repo.description || ''} ${repo.language || ''}`.toLowerCase();
  const tags = [];
  if (/claude|cc|claw/.test(base)) tags.push('Claude Code');
  if (/codex/.test(base)) tags.push('Codex');
  if (/agent|agente|agentic|subag/.test(base)) tags.push('Agentes');
  if (/prompt/.test(base)) tags.push('Prompts');
  if (/film|video|remotion|youtube|yt|lives|clips/.test(base)) tags.push('Vídeo');
  if (/consult|estrateg|strategy|vendas|8020/.test(base)) tags.push('Negócios');
  if (/skill|hook|mcp|hermes/.test(base)) tags.push('Skills');
  if (/curso|forma[cç][aã]o|trilha|club|academy/.test(base)) tags.push('Curso');
  if (/telegram/.test(base)) tags.push('Telegram');
  if (repo.language) tags.push(repo.language);
  return unique(tags).slice(0, 6);
}

function detectIcon(tags) {
  if (tags.includes('Agentes')) return '🤖';
  if (tags.includes('Negócios')) return '💼';
  if (tags.includes('Vídeo')) return '🎬';
  if (tags.includes('Prompts')) return '🧠';
  if (tags.includes('Skills')) return '🧩';
  if (tags.includes('Claude Code')) return '⚙️';
  return '🚀';
}

function buildUnifiedCatalog(catalog, repos) {
  const repoMap = new Map(repos.map(repo => [repoKey(repo.name), repo.name]));
  const curated = catalog.map(item => {
    const matchedRepo = repoMap.get(repoKey(item.title));
    return {
      title: item.title,
      description: item.description,
      group: item.group,
      tags: item.tags || [],
      date: item.date || '',
      link: matchedRepo ? buildRepoLink(matchedRepo) : (item.link || CABRAL_GITHUB_ROOT),
      language: null,
      source: 'catalog'
    };
  });

  const catalogLinks = new Set(curated.map(item => item.link).filter(Boolean));
  const repoDerived = repos
    .filter(repo => !catalogLinks.has(buildRepoLink(repo.name)))
    .map(repo => ({
      title: repo.name,
      description: repo.description || 'Repositório público do acervo técnico espelhado.',
      group: repo.language ? `CABRAL.${repo.language.toUpperCase()}` : 'CABRAL.GITHUB',
      tags: detectTags(repo),
      date: formatDate(repo.updated_at),
      link: buildRepoLink(repo.name),
      language: repo.language || 'n/d',
      source: 'repo',
      updated_at: repo.updated_at,
      stars: repo.stars || 0,
      forks: repo.forks || 0,
      license: repo.license || null
    }));

  return [...curated, ...repoDerived]
    .sort((a, b) => new Date(b.updated_at || b.date || 0) - new Date(a.updated_at || a.date || 0));
}

// --- Versão e data ---
function setVersionDate() {
  const now = new Date();
  const ver = `v${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}.${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
  const dateStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const verEl = document.getElementById('proVersion');
  const dateEl = document.getElementById('proDate');
  if (verEl) verEl.textContent = ver;
  if (dateEl) dateEl.textContent = dateStr;
}

async function initPortal() {
  const [reposPayload, catalog] = await Promise.all([
    loadJson('data/repos.json'),
    loadJson('data/catalog.json')
  ]);

  const repos = reposPayload.repos || [];
  const unified = buildUnifiedCatalog(catalog, repos);
  const languages = unique(repos.map(repo => repo.language).filter(Boolean));

  // Contadores
  const repoCount = document.getElementById('repoCount');
  const courseCount = document.getElementById('courseCount');
  const langCount = document.getElementById('langCount');
  const viewCount = document.getElementById('viewCount');
  const memberCount = document.getElementById('memberCount');

  if (repoCount) repoCount.textContent = String(repos.length);
  if (courseCount) courseCount.textContent = String(catalog.length);
  if (langCount) langCount.textContent = String(languages.length);
  if (viewCount) viewCount.textContent = '134821';
  if (memberCount) memberCount.textContent = '64046';

  // Trilha iniciantes
  const beginnerNames = ['FEP', 'ATIA', 'FDB', 'VISION'];
  const beginnerTrack = beginnerNames.map(name => {
    const repo = repos.find(item => item.name.toLowerCase() === name.toLowerCase()) || {};
    const curated = catalog.find(item => item.link && item.link.toLowerCase().includes(`/${name.toLowerCase()}`));
    return {
      code: name,
      title: curated?.title || repo.name || name,
      description: curated?.description || repo.description || 'Item base da trilha inicial.',
      link: repo.name ? buildRepoLink(repo.name) : (curated?.link || CABRAL_GITHUB_ROOT)
    };
  });

  const beginnerWrap = document.getElementById('beginnerTrack');
  if (beginnerWrap) {
    beginnerWrap.replaceChildren(...beginnerTrack.map((item, index) => el(`
      <a class="track-card" href="${item.link}" target="_blank" rel="noreferrer">
        <div class="track-index">${index + 1}</div>
        <h4>${item.code}</h4>
        <strong>${item.title}</strong>
        <p>${item.description}</p>
      </a>
    `)));
  }

  // Feed repositórios (estilo inema.club)
  const recentRepos = repos
    .slice()
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 7);

  const reposWrap = document.getElementById('recentRepos');
  if (reposWrap) {
    reposWrap.replaceChildren(...recentRepos.map(repo => el(`
      <a class="feed-item feed-item-link" href="${buildRepoLink(repo.name)}" target="_blank" rel="noreferrer">
        <span class="feed-date">${formatDate(repo.updated_at)}</span>
        <span class="feed-badge">${repo.description ? 'NOVO' : 'ATUALIZADO'}</span>
        <strong class="feed-repo-name">${repo.name}</strong>
        <span class="feed-desc"> — ${repo.description || 'Repositório público do perfil espelhado.'} →</span>
      </a>
    `)));
  }

  // Feed cursos
  const recentCourses = unified
    .filter(item => item.tags.includes('Curso') || /CABRAL\./.test(item.group))
    .slice(0, 7);

  const coursesWrap = document.getElementById('recentCourses');
  if (coursesWrap) {
    coursesWrap.replaceChildren(...recentCourses.map(item => el(`
      <a class="feed-item feed-item-link" href="${item.link}" target="_blank" rel="noreferrer">
        <span class="feed-date">${item.date || formatDate(item.updated_at)}</span>
        <span class="feed-badge">NOVO</span>
        <strong class="feed-repo-name">${item.title} →</strong>
      </a>
    `)));
  }

  // Catálogo com busca
  const search = document.getElementById('portalSearch');
  const tagsWrap = document.getElementById('portalTags');
  const gridWrap = document.getElementById('portalCatalog');
  const allTags = unique(unified.flatMap(item => item.tags || [])).slice(0, 24);
  let activeTag = 'Todos';

  function renderTags() {
    const options = ['Todos', ...allTags];
    tagsWrap.replaceChildren(...options.map(tag => {
      const button = el(`<button class="chip ${tag === activeTag ? 'active' : ''}">${tag}</button>`);
      button.addEventListener('click', () => {
        activeTag = tag;
        renderTags();
        renderGrid();
      });
      return button;
    }));
  }

  function renderGrid() {
    const term = slug(search ? search.value.trim() : '');
    const filtered = unified.filter(item => {
      const hay = slug([item.title, item.description, item.group, ...(item.tags || [])].join(' '));
      const matchesTag = activeTag === 'Todos' || (item.tags || []).includes(activeTag);
      const matchesText = !term || hay.includes(term);
      return matchesTag && matchesText;
    }).slice(0, 48);

    gridWrap.replaceChildren(...filtered.map(item => {
      const tags = item.tags || [];
      const icon = detectIcon(tags);
      return el(`
        <article class="portal-card">
          <div class="repo-icon">${icon}</div>
          <div>
            <h4>${item.title}</h4>
            <div class="meta-row">
              <span>${item.group}</span>
              <span>${item.date || formatDate(item.updated_at)}</span>
              ${item.language ? `<span>${item.language}</span>` : ''}
            </div>
          </div>
          <p>${item.description}</p>
          <div class="tag-row">${tags.slice(0, 6).map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
          <a class="cta-link" href="${item.link}" target="_blank" rel="noreferrer">Acessar plataforma →</a>
        </article>
      `);
    }));
  }

  if (search) search.addEventListener('input', renderGrid);
  renderTags();
  renderGrid();
}

async function initPro() {
  const [reposPayload, catalog] = await Promise.all([
    loadJson('data/repos.json'),
    loadJson('data/catalog.json')
  ]);

  const repos = reposPayload.repos || [];
  const unified = buildUnifiedCatalog(catalog, repos);
  const groups = ['Todos', ...unique(unified.map(item => item.group)).slice(0, 16)];
  const resultsWrap = document.getElementById('libraryResults');
  const groupsWrap = document.getElementById('libraryGroups');
  const search = document.getElementById('librarySearch');
  const resultMeta = document.getElementById('resultMeta');
  const countNode = document.getElementById('libraryCount');
  const modeBoth = document.getElementById('modeBoth');
  const modeTitle = document.getElementById('modeTitle');
  const modeDesc = document.getElementById('modeDesc');

  // Contadores nos shortcuts
  const telegramCount = document.getElementById('telegramCount');
  const livesCount = document.getElementById('livesCount');
  const trilhasCount = document.getElementById('trilhasCount');
  const cursosCount = document.getElementById('cursosCount');
  if (telegramCount) telegramCount.textContent = '6';
  if (livesCount) livesCount.textContent = String(repos.length);
  if (trilhasCount) trilhasCount.textContent = String(catalog.length);
  if (cursosCount) cursosCount.textContent = String(catalog.filter(i => i.tags.includes('Curso')).length);

  if (countNode) countNode.textContent = String(unified.length);

  let activeGroup = 'Todos';
  let mode = 'both';

  function setMode(next) {
    mode = next;
    [modeBoth, modeTitle, modeDesc].forEach(node => node.classList.remove('active'));
    if (mode === 'both') modeBoth.classList.add('active');
    if (mode === 'title') modeTitle.classList.add('active');
    if (mode === 'desc') modeDesc.classList.add('active');
    renderResults();
  }

  if (modeBoth) modeBoth.addEventListener('click', () => setMode('both'));
  if (modeTitle) modeTitle.addEventListener('click', () => setMode('title'));
  if (modeDesc) modeDesc.addEventListener('click', () => setMode('desc'));

  document.querySelectorAll('[data-shortcut]').forEach(node => {
    node.addEventListener('click', () => {
      const map = {
        telegram: 'telegram',
        lives: 'youtube',
        trilhas: 'curso',
        cursos: 'claude'
      };
      if (search) search.value = map[node.dataset.shortcut] || '';
      renderResults();
    });
  });

  function renderGroups() {
    if (!groupsWrap) return;
    groupsWrap.replaceChildren(...groups.map(group => {
      const button = el(`<button class="chip ${group === activeGroup ? 'active' : ''}">${group}</button>`);
      button.addEventListener('click', () => {
        activeGroup = group;
        renderGroups();
        renderResults();
      });
      return button;
    }));
  }

  function renderResults() {
    if (!search) return;
    const term = slug(search.value.trim());
    const filtered = unified.filter(item => {
      const title = slug(item.title);
      const desc = slug(item.description);
      const full = slug([item.title, item.description, item.group, ...(item.tags || []), item.language || ''].join(' '));
      const matchesGroup = activeGroup === 'Todos' || item.group === activeGroup;
      const matchesText = !term || (mode === 'title' ? title.includes(term) : mode === 'desc' ? desc.includes(term) : full.includes(term));
      return matchesGroup && matchesText;
    });

    if (resultMeta) resultMeta.textContent = `${filtered.length} resultado(s) · filtro: ${activeGroup}`;
    if (resultsWrap) {
      resultsWrap.replaceChildren(...filtered.slice(0, 80).map(item => el(`
        <article class="library-item">
          <div class="title-line">
            <strong>${item.title}</strong>
            <span class="language-badge">${item.language || item.group}</span>
          </div>
          <div class="meta-row">
            <span>Grupo: ${item.group}</span>
            <span>Data: ${item.date || formatDate(item.updated_at)}</span>
            ${item.source === 'repo' ? '<span>Fonte: GitHub</span>' : '<span>Fonte: Curadoria</span>'}
          </div>
          <p>${item.description}</p>
          <div class="tag-row">${(item.tags || []).slice(0, 7).map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
          <a href="${item.link}" target="_blank" rel="noreferrer">Abrir origem →</a>
        </article>
      `)));
    }
  }

  if (search) search.addEventListener('input', renderResults);
  renderGroups();
  renderResults();
}

// Init
setVersionDate();
if (document.body.dataset.page === 'portal') initPortal().catch(console.error);
if (document.body.dataset.page === 'pro') initPro().catch(console.error);
