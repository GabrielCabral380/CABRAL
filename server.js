const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('.'));

// Ollama proxy — /ollama/* → Ollama server
app.use('/ollama', createProxyMiddleware({
  target: OLLAMA_URL,
  changeOrigin: true,
  pathRewrite: { '^/ollama': '' },
  onError: (err, req, res) => {
    res.status(502).json({ error: 'Ollama não disponível', detail: err.message });
  }
}));

// Health check
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', ollama: OLLAMA_URL, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 CABRAL.CLUB rodando em http://localhost:${PORT}`);
  console.log(`🦙 Ollama proxy: /ollama → ${OLLAMA_URL}`);
});
