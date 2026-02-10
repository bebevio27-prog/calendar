#!/bin/bash

echo "🚀 Setup Agenda Personale"
echo "=========================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non è installato!"
    echo "   Scaricalo da https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js trovato: $(node --version)"
echo ""

# Navigate to frontend
cd frontend

# Install dependencies
echo "📦 Installazione dipendenze..."
npm install

# Check for .env file
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  File .env non trovato!"
    echo "   1. Copia .env.example in .env"
    echo "   2. Inserisci le tue credenziali Firebase"
    echo ""
    echo "   cp .env.example .env"
    echo ""
else
    echo "✅ File .env trovato"
fi

echo ""
echo "✨ Setup completato!"
echo ""
echo "Per avviare l'app:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Per maggiori informazioni, leggi INSTALLAZIONE.md"
