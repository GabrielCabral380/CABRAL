# CABRAL.CLUB — Portal CABRAL

Portal principal do projeto CABRAL — cursos, trilhas, plataformas e agentes de IA.

## 🌐 URLs

- **Portal:** https://gabrielcabral380.github.io/CABRAL/
- **GitHub:** https://github.com/GabrielCabral380

## 🤖 Provedores de IA

- **OpenRouter** — Multi-modelo cloud
- **OpenAI** — GPT-4o, GPT-4o-mini
- **NVIDIA NIM** — Llama 3.1, Mistral
- **Ollama** — IA local (auto-detecção)

## 🚀 Como rodar

### GitHub Pages (estático)
```bash
# Apenas abra index.html ou use um servidor local
npx serve .
```

### Com backend Ollama
```bash
npm install
npm start
# Acesse http://localhost:3000
```

### Docker
```bash
docker build -t cabral-club .
docker run -p 3000:3000 cabral-club
```

## 📁 Estrutura

```
├── index.html      # Página principal
├── styles.css      # Estilos (tema INEMA)
├── app.js          # JavaScript principal
├── server.js       # Backend Node.js (proxy Ollama)
├── Dockerfile      # Container Docker
├── package.json    # Dependências
└── data/           # Dados estáticos
```

## 🦙 Ollama

O Ollama é integrado como provedor de IA local. O servidor atua como proxy para evitar CORS.

- **URL padrão:** `http://localhost:11434`
- **Modelo padrão:** `llama3`
- **Remover:** Diga "remove ollama" no chat do JARVIS

## 📄 Licença

MIT — © 2026 CABRAL.CLUB
