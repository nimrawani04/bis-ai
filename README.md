#  <img src="./public/favicon.ico" height=25 style="border-radius:50%;"> BIS AI — Bureau of Indian Standards

> AI-powered product safety verification platform with offline-first design for rural India.

![Stack](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-green) ![Vite](https://img.shields.io/badge/Vite-5-purple)

---


## 🚀 Overview  

**BIS AI** is an intelligent assistant that helps users access and understand information from the Bureau of Indian Standards (BIS).

It uses a **Retrieval-Augmented Generation (RAG)** pipeline to fetch verified content from BIS sources and generate **accurate, source-backed answers**.

**Goal:** Make product safety, certification, and standards easy to understand for everyone, including users in low-connectivity rural areas.

---

## 🧠 Features  

- 🤖 AI chatbot for BIS queries  
- 📸 Product image scanner (ISI/BIS detection)  
- 📴 Offline-first PWA  
- 🌐 Multilingual support (9 languages)  
- ⚡ Low bandwidth & simple mode  
- 📊 Safety alerts, product comparison, reports  

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend (PWA)                │
│  React 18 + TypeScript + Vite + Tailwind CSS    │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐  │
│  │  Pages    │ │Components│ │  Offline Data  │  │
│  │ BISHome   │ │ Hero     │ │ Knowledge Base │  │
│  │ BISChat   │ │ Scanner  │ │ 9 Languages    │  │
│  │ Standards │ │ Alerts   │ │ Service Worker │  │
│  └───────────┘ └──────────┘ └────────────────┘  │
└────────────────────┬────────────────────────────┘
                     │ HTTPS / REST
┌────────────────────▼────────────────────────────┐
│              Backend (Supabase)                 │
│          Supabase (PostgreSQL + Auth)           │
│  ┌─────────────────────────────────────────┐    │
│  │         Edge Functions (Deno)           │    │
│  │  • safety-assistant    (AI chat)        │    │
│  │  • bis-chat            (BIS Q&A)        │    │
│  │  • analyze-product-image (vision AI)    │    │
│  │  • home-safety-report  (PDF reports)    │    │
│  └──────────────┬──────────────────────────┘    │
│                 │                               │
│  ┌──────────────▼──────────────────────────┐    │
│  │    Google Gemini API                    │    │
│  │    Gemini 2.5 Flash                     │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  Database Tables                        │    │
│  │  • product_reports    • safety_alerts   │    │
│  │  • product_reviews    • scan_history    │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---


## Project Structure

```
├── public/                     # Static assets, PWA icons
├── src/
│   ├── assets/                 # Images (Ashoka Chakra, etc.)
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── Header.tsx          # Main navigation
│   │   ├── Hero.tsx            # Landing hero (low-bandwidth aware)
│   │   ├── SmartSafetyAssistant.tsx  # AI chat (online/offline)
│   │   ├── OfflineSafetyAssistant.tsx # Offline search + voice
│   │   ├── HouseholdScanner.tsx      # Image analysis
│   │   ├── LowBandwidthToggle.tsx    # ⚡ toggle
│   │   └── ...
│   ├── data/
│   │   ├── products.ts                    # Product database
│   │   ├── offlineKnowledgeBase.ts        # Offline BIS data
│   │   └── offlineKnowledgeMultilingual.ts # 9-language translations
│   ├── hooks/
│   │   ├── useOnlineStatus.ts   # Network detection
│   │   ├── useLowBandwidth.tsx  # Bandwidth context provider
│   │   ├── useAuth.tsx          # Authentication
│   │   └── use-mobile.tsx       # Responsive detection
│   ├── integrations/
│   │   └── supabase/            # Auto-generated client & types
│   ├── pages/
│   │   ├── BISHome.tsx          # Main landing page
│   │   ├── BISChat.tsx          # AI chat page
│   │   ├── CertificationGuide.tsx
│   │   ├── StandardsExplorer.tsx
│   │   └── AboutBIS.tsx
│   ├── App.tsx                  # Root with providers
│   ├── main.tsx                 # Entry point
│   └── index.css                # Design tokens & Tailwind
├── supabase/
│   ├── functions/
│   │   ├── safety-assistant/    # AI streaming chat
│   │   ├── bis-chat/            # BIS Q&A
│   │   ├── analyze-product-image/ # Vision AI scanner
│   │   └── home-safety-report/  # PDF generation
│   └── config.toml              # Supabase configuration
├── vite.config.ts               # Vite + PWA config
├── tailwind.config.ts           # Design system tokens
└── package.json
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- npm or bun

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/nimrawani04/bis-ai.git
cd BIS-AI

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# App runs at http://localhost:8080
```

## 🔍 How It Works  

1. Crawl BIS website data  
2. Convert content into embeddings  
3. Store in vector database  
4. On user query:
   - Retrieve relevant data  
   - Generate AI response  
   - Provide source citations  

---

## 🛠️ Tech Stack  

**Frontend:**  
React • TypeScript • Tailwind • React Query • Framer Motion  

**Backend:**  
Supabase • PostgreSQL • Deno  

**AI & Data:**  
Gemini API • pgvector • Firecrawl  

---


## License
- MIT
### 👩‍💻 Developers

- 🔹 **Nimra Wani** — [Portfolio](https://nimrawani.vercel.app/)
- 🔹 **Milad Ajaz Bhat** — [Portfolio](https://m4milaad.github.io/)

