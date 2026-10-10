# 🎮 Game Finder

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.x-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-06B6D4?style=for-the-badge&logo=tailwindcss)
![Google Gemini](https://img.shields.io/badge/Gemini_AI-3.5_Flash_Lite-8E75B2?style=for-the-badge&logo=google)
![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)

**A next-generation AI-powered video game discovery engine and personal library tracker.**

[Key Features](#-key-features) • [Tech Stack](#-technology-stack) • [Quick Start](#-quick-start) • [Project Structure](#-project-structure) • [Testing](#-testing--quality)

</div>

---

## 🌟 Overview

**Game Finder** is a digital store-inspired gaming platform and intelligent matchmaker. Evolved from an AI prototype into a production-grade full-stack web application, Game Finder combines **Google Gemini AI recommendations**, digital store discovery browsing (cinematic carousels, genre hubs, curated shelves), comprehensive game detail profiles with trailer streaming, and personal library management (backlog tracking, user ratings, and ranked Top 10 lists).

Designed with a sleek, dark Steam-inspired aesthetic, purple/indigo glassmorphism accents, and GPU-accelerated micro-interactions across desktop, tablet, and mobile.

---

## ✨ Key Features

### 🤖 AI-Powered Matchmaker (`/finder`)
- **Three-Step Guided Wizard**: Tailor recommendations by **Genre & Mood Vibe**, **Difficulty & Age Rating**, and open-ended **Natural Language Prompts**.
- **Gemini AI Engine**: Powered by Google Gemini (`gemini-3.5-flash-lite`) via LangChain to deeply understand player intent, thematic preferences, and difficulty nuances.
- **Dynamic Metadata Enrichment**: Matches each AI recommendation with official Steam store art, genres, release dates, and store links.

### 🏬 Digital Storefront & Discovery Hub (`/`)
- **Cinematic Hero Carousel**: Dynamic featured showcases highlighting trending benchmarks with direct store links.
- **Curated Store Shelves**: Real-time carousels for *Trending Now*, *New Releases*, *Top Rated*, and *Hidden Gems*.
- **Interactive Genre Exploration**: 12 responsive genre exploration hubs (Action, RPG, Strategy, Indie, Roguelike, Cyberpunk, etc.).
- **Global Quick Search**: Keyboard-friendly (`Cmd/Ctrl + K` / `ESC`) instant catalog search modal with query debouncing and autocomplete pills.

### 🏆 GOTY Hall of Fame Archive (`/goty`)
- **Historic Annual Archive**: Explore Game of the Year winners and official nominees from The Game Awards (2014 to present).
- **One-Click Library Integration**: Seamlessly add any past winner or nominee directly to your personal shelf.

### 🎬 Comprehensive Game Profile Pages (`/games/[id]`)
- **Media Showcase**: Dedicated HTML5 video trailer streaming player (limited to 1 primary trailer per profile) alongside high-definition screenshots.
- **Fullscreen Lightbox**: Keyboard-navigable image gallery with zoom and preview modes.
- **Clean Semantic Descriptions**: Automated HTML sanitization and entity decoding that converts raw Steam markup into readable paragraphs.
- **Hardware & Credits**: PC minimum and recommended system requirements, verified developer/publisher tags, and release dates.

### 📚 Personal Library & Backlog Management (`/library`)
- **Shelf Status Organization**: Sort games across *Playing*, *Completed*, *Plan to Play*, *On Hold*, and *Dropped*.
- **Favorites & Statistics**: Real-time counter of total games, in-progress backlogs, and favorited titles.
- **Optimistic State Updates**: Instant UI transitions with fallback synchronization to Supabase and local storage.

### ⭐ Ratings, Reviews & Top 10 Lists
- **Community & User Reviews**: Interactive 5-star rating input with rich markdown review support.
- **Prestige Top 10 Curator**: Rank your personal all-time top 10 games with tier badges (Masterpiece, Elite, Gold).

---

## 🛠 Technology Stack

### Frontend
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) with React 19 / Server Components
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS & Glassmorphism design tokens
- **Icons & Motion**: Lucide React & Framer Motion
- **Testing**: Vitest & React Testing Library (131 automated tests)

### Backend
- **Framework**: [FastAPI 0.115+](https://fastapi.tiangolo.com/) (Asynchronous Python)
- **Runtime**: Python 3.11+
- **AI Orchestration**: LangChain & Google GenAI SDK (`@google/genai`)
- **Validation**: Pydantic v2
- **Testing**: Pytest & pytest-asyncio (105 automated tests)

### Database & Security
- **Database & Auth**: PostgreSQL via Supabase with Row Level Security (RLS)
- **Tokens**: Secure JWT session persistence
- **CORS Protection**: Origin regex filtering permitting authorized clients

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.18+ or v20+
- **Python**: v3.11+
- **Google Gemini API Key**: [Get a free API key from Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/AyushSGO07/Game-Finder.git
cd Game-Finder
```

### 2. Environment Configuration

#### Backend `.env` (Project Root)
Create a `.env` file in the project root:
```env
# Google Gemini API Key
GEMINI_API_KEY="your-google-gemini-api-key"
GEMINI_MODEL="gemini-3.5-flash-lite"

# Server Settings
PROJECT_NAME="Game Finder API"
API_V1_STR="/api/v1"

# Allowed CORS origins
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000","http://localhost:8000"]

# Optional Steam & Supabase settings
STEAM_API_KEY="your-optional-steam-api-key"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
```

#### Frontend `frontend/.env.local`
Create a `.env.local` file inside the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

### 3. Install Dependencies

#### Backend Dependencies
```bash
# Create and activate virtual environment
python -m venv .venv

# Windows:
.\.venv\Scripts\activate

# macOS / Linux:
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

#### Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

---

### 4. Running the Servers

#### Method A: One-Command Full Stack Launchers (Recommended)

- **PowerShell (Windows)**:
  ```powershell
  .\run_full_server.ps1
  ```
- **Command Prompt / Double-Click (Windows)**:
  ```cmd
  start_servers.bat
  ```

#### Method B: Manual Startup

In **Terminal 1** (Backend):
```bash
# Make sure virtual environment is active
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

In **Terminal 2** (Frontend):
```bash
cd frontend
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

| Service | Address |
|---|---|
| **Web Application** | [http://localhost:3000](http://localhost:3000) |
| **Backend API Health** | [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health) |
| **Swagger Interactive Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) |

---

## 📁 Project Structure

```
Game-Finder/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Endpoints (auth, games, library, recommendations)
│   │   ├── core/            # Config, security, settings
│   │   ├── schemas/         # Pydantic v2 data models
│   │   ├── services/        # Gemini, Steam, Cache, Supabase, Fallback services
│   │   └── main.py          # FastAPI application entry & CORS middleware
│   └── tests/               # Pytest integration & unit test suite
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages (/, /finder, /goty, /library, /games/[id])
│   │   ├── components/      # UI components (discovery, finder, game, goty, library, layout)
│   │   ├── context/         # AuthContext & LibraryContext
│   │   ├── lib/             # API client, HTML sanitizer, mock fallback data
│   │   └── types/           # TypeScript interfaces & domain contracts
│   └── src/__tests__/       # Vitest component & route integration tests
├── supabase/                # PostgreSQL schema definitions & migrations
├── run_full_server.ps1      # PowerShell one-click launcher
├── start_servers.bat        # Windows CMD one-click launcher
├── requirements.txt         # Python package dependencies
└── README.md
```

---

## 🧪 Testing & Quality

Both the frontend and backend maintain complete test coverage:

### Running Frontend Tests (Vitest)
```bash
cd frontend
npm test
```
*Output: 37 test files, 131 tests passing.*

### Checking Frontend Types & Production Build
```bash
cd frontend
npx tsc --noEmit
npm run build
```

### Running Backend Tests (Pytest)
```bash
pytest
```
*Output: 105 tests passing across API routes, schemas, and AI services.*

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
