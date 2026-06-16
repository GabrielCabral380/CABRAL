/* ============================================
   CABRAL.CLUB — Portal CABRAL
   JavaScript Principal
   ============================================ */

// ── VIEW COUNTER ──
(function() {
  let views = parseInt(localStorage.getItem('cabral-views') || '0');
  views++;
  localStorage.setItem('cabral-views', views.toString());
  const vc = document.getElementById('viewCount');
  if (vc) vc.textContent = views.toLocaleString('pt-BR');
  const mc = document.getElementById('memberCount');
  if (mc) mc.textContent = Math.floor(views * 0.6).toLocaleString('pt-BR');
})();

// ── TOGGLE UPDATES ──
function toggleUpdates(type) {
  const list = document.getElementById('updates-' + type);
  const toggle = document.getElementById('toggle-' + type);
  if (!list || !toggle) return;
  const isHidden = list.style.display === 'none';
  list.style.display = isHidden ? '' : 'none';
  toggle.textContent = isHidden ? 'Ver menos' : 'Ver mais';
}

// ── SEARCH / FILTER CARDS ──
function filterCards() {
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  document.querySelectorAll('.card').forEach(card => {
    const title = card.dataset.title || '';
    const tags = card.dataset.tags || '';
    const desc = card.querySelector('.card-description')?.textContent || '';
    const match = !q || title.toLowerCase().includes(q) || tags.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    card.classList.toggle('hidden', !match);
  });
}

// ── GITHUB REPOS ──
async function loadGitHubRepos() {
  const container = document.getElementById('githubRepos');
  if (!container) return;

  const repos = [
    { name: 'CABRAL', desc: 'Portal principal — cursos, trilhas e plataformas', lang: 'HTML', stars: 0, url: 'https://github.com/GabrielCabral380/CABRAL' },
    { name: 'JARVIS', desc: 'Assistente IA Pessoal com voz, alarmes e 50+ integrações', lang: 'JavaScript', stars: 0, url: 'https://github.com/GabrielCabral380/JARVIS' },
    { name: 'agentehermes', desc: 'Agente IA Self-Hosted com Docker, Telegram e GitHub', lang: 'Python', stars: 0, url: 'https://github.com/GabrielCabral380/agentehermes' },
    { name: 'claude-code', desc: 'Claude Code na Prática — do Zero ao Produto', lang: 'Markdown', stars: 0, url: 'https://github.com/GabrielCabral380/claude-code' },
    { name: 'agentic', desc: 'Agentic Engineering Masterclass', lang: 'Python', stars: 0, url: 'https://github.com/GabrielCabral380/agentic' },
    { name: 'aifilmmaking', desc: 'AI FILMMAKING — Do Conceito ao Filme Final', lang: 'Markdown', stars: 0, url: 'https://github.com/GabrielCabral380/aifilmmaking' },
  ];

  // Try to fetch real star counts from GitHub API
  await Promise.all(repos.map(async repo => {
    try {
      const r = await fetch('https://api.github.com/repos/GabrielCabral380/' + repo.name, {
        signal: AbortSignal.timeout(5000)
      });
      if (r.ok) {
        const d = await r.json();
        repo.stars = d.stargazers_count || 0;
        repo.desc = d.description || repo.desc;
        repo.lang = d.language || repo.lang;
      }
    } catch { /* silent */ }
  }));

  container.innerHTML = repos.map(repo => `
    <a href="${repo.url}" target="_blank" rel="noopener noreferrer" class="repo-card">
      <div class="repo-name">📁 ${repo.name}</div>
      <div class="repo-desc">${repo.desc}</div>
      <div class="repo-meta">
        <span class="repo-lang">● ${repo.lang}</span>
        <span class="repo-stars">⭐ ${repo.stars}</span>
      </div>
    </a>
  `).join('');
}

// ── UPDATES DATA ──
const repoUpdates = [
  { date: '16/06', type: 'atualizado', title: 'jarvis — Assistente com Ollama integrado', url: 'https://github.com/GabrielCabral380/JARVIS' },
  { date: '16/06', type: 'novo', title: 'cabral-site — Portal CABRAL igual ao INEMA', url: 'https://github.com/GabrielCabral380/CABRAL' },
  { date: '15/06', type: 'novo', title: 'agentehermes — Agente IA Self-Hosted', url: 'https://github.com/GabrielCabral380/agentehermes' },
  { date: '15/06', type: 'atualizado', title: 'claude-code — Curso completo', url: 'https://github.com/GabrielCabral380/claude-code' },
  { date: '14/06', type: 'novo', title: 'agentic — Agentic Engineering Masterclass', url: 'https://github.com/GabrielCabral380/agentic' },
];

const courseUpdates = [
  { date: '16/06', type: 'novo', title: 'JARVIS — Assistente IA Pessoal com Voz e Ollama', url: 'https://gabrielcabral380.github.io/JARVIS/' },
  { date: '16/06', type: 'novo', title: 'CABRAL Portal — Portal de Cursos e Plataformas', url: 'https://gabrielcabral380.github.io/CABRAL/' },
  { date: '15/06', type: 'novo', title: 'Agente Hermes — Assistente IA Self-Hosted', url: 'https://gabrielcabral380.github.io/agentehermes' },
  { date: '15/06', type: 'novo', title: 'Claude Code na Prática — do Zero ao Produto', url: 'https://gabrielcabral380.github.io/claude-code' },
  { date: '14/06', type: 'novo', title: 'Agentic Engineering — Masterclass Completa', url: 'https://gabrielcabral380.github.io/agentic' },
];

function renderUpdates() {
  const repoList = document.getElementById('updates-repo');
  const cursosList = document.getElementById('updates-cursos');
  if (!repoList || !cursosList) return;

  const mkItem = u => `
    <a class="update-item" href="${u.url}" target="_blank" rel="noopener noreferrer" title="${u.title}">
      <span class="update-date">${u.date}</span>
      <span class="update-type ${u.type}">${u.type}</span>
      <span class="update-title">${u.title}</span>
      <span class="update-arrow">→</span>
    </a>
  `;

  repoList.innerHTML = repoUpdates.map(mkItem).join('');
  cursosList.innerHTML = courseUpdates.map(mkItem).join('');
}

// ── OLLAMA SERVER (embedded) ──
// O Ollama é servido pelo backend no repositório
// URL padrão: mesma origem (produção) ou localhost:11434 (desenvolvimento)

const OLLAMA_CONFIG = {
  // Em produção, o backend serve o Ollama via proxy
  // Em desenvolvimento, conecta direto
  baseUrl: window.location.hostname === 'localhost' ? 'http://localhost:11434' : '/ollama',
  model: 'llama3',
  enabled: true
};

async function ollamaChat(message) {
  if (!OLLAMA_CONFIG.enabled) throw new Error('Ollama desativado');

  const r = await fetch(OLLAMA_CONFIG.baseUrl.replace(/\/$/, '') + '/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_CONFIG.model,
      messages: [{ role: 'user', content: message }],
      stream: false
    })
  });
  if (!r.ok) throw new Error('Ollama HTTP ' + r.status);
  const d = await r.json();
  return d.message?.content || 'Sem resposta.';
}

async function ollamaStatus() {
  try {
    const r = await fetch(OLLAMA_CONFIG.baseUrl.replace(/\/$/, '') + '/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    if (!r.ok) return { ok: false };
    const d = await r.json();
    return { ok: true, models: (d.models || []).map(m => m.name) };
  } catch {
    return { ok: false };
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  renderUpdates();
  loadGitHubRepos();

  // Check Ollama status
  ollamaStatus().then(status => {
    if (status.ok) {
      console.log('🦙 Ollama conectado:', status.models?.join(', '));
    } else {
      console.log('⚠️ Ollama não disponível');
    }
  });
});
