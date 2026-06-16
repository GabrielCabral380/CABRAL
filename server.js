const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

app.use(cors());
app.use(express.json());

// ── Serve static files (GitHub Pages fallback) ──
app.use(express.static('.'));

// ── Ollama proxy — /ollama/* → Ollama server ──
// Usa http nativo para evitar dependência de http-proxy-middleware
app.all('/ollama/*', (req, res) => {
  const ollamaPath = req.path.replace(/^\/ollama/, '') || '/';
  const ollamaHost = new URL(OLLAMA_URL);

  const options = {
    hostname: ollamaHost.hostname,
    port: ollamaHost.port || 11434,
    path: ollamaPath,
    method: req.method,
    headers: {
      ...req.headers,
      host: ollamaHost.hostname,
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Ollama proxy error:', err.message);
    res.status(502).json({ error: 'Ollama não disponível', detail: err.message });
  });

  req.pipe(proxyReq, { end: true });
});

// ── Health check ──
app.get('/api/status', async (req, res) => {
  let ollamaOk = false;
  let models = [];
  try {
    const r = await fetch(OLLAMA_URL.replace(/\/$/, '') + '/api/tags', {
      signal: AbortSignal.timeout(3000)
    });
    if (r.ok) {
      const d = await r.json();
      ollamaOk = true;
      models = (d.models || []).map(m => m.name);
    }
  } catch { /* silent */ }

  res.json({
    status: 'ok',
    ollama: { url: OLLAMA_URL, ok: ollamaOk, models },
    timestamp: new Date().toISOString()
  });
});

// ── Ollama chat endpoint (simplificado) ──
app.post('/api/chat', async (req, res) => {
  const { message, model = 'llama3' } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  try {
    const r = await fetch(OLLAMA_URL.replace(/\/$/, '') + '/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: message }],
        stream: false
      }),
      signal: AbortSignal.timeout(120000)
    });
    if (!r.ok) throw new Error('Ollama HTTP ' + r.status);
    const d = await r.json();
    res.json({ response: d.message?.content || 'Sem resposta.', model });
  } catch (err) {
    res.status(502).json({ error: 'Ollama error', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 CABRAL.CLUB rodando em http://localhost:${PORT}`);
  console.log(`🦙 Ollama: ${OLLAMA_URL}`);
});
