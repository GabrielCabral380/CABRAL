#!/bin/bash
set -e

# Inicia Ollama em background
ollama serve &
OLLAMA_PID=$!

# Aguarda Ollama estar pronto
echo "⏳ Aguardando Ollama iniciar..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama pronto!"
    break
  fi
  sleep 2
done

# Baixa modelo padrão (llama3)
echo "📥 Baixando modelo llama3..."
ollama pull llama3 2>/dev/null || echo "⚠️ Erro ao baixar llama3 (modelo será baixado no primeiro uso)"

# Mantém o processo vivo
wait $OLLAMA_PID
