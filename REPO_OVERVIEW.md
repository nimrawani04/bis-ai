## BIS-AI Repository Overview

This document explains the **major features, modules, and architecture** of the BIS-AI project in more depth than the `README`, so you can quickly understand how everything fits together and where to make changes.

---

## 1. High-Level Purpose and Vision

- **Core goal**: Make Bureau of Indian Standards (BIS) information and product safety guidance **accessible, understandable, and trustworthy** for Indian consumers, including those in **low-connectivity rural areas**.
- **Key capabilities**:
  - AI-powered BIS Q&A with **source citations** from the official BIS website.
  - Product safety tools (verification, risk assessment, comparison, reports, alerts).
  - Offline-first experience with **multilingual knowledge base** and PWA installation.
  - Admin tools for **crawling, ingesting, and maintaining** a BIS-focused RAG knowledge base.

---

## 2. Top-Level Architecture

- **Frontend**: A **React 18 + TypeScript + Vite** single-page application, styled with **Tailwind CSS** and **shadcn/ui**, and packaged as a **PWA** (offline-capable, installable).
- **Backend**: A **Supabase** project providing:
  - PostgreSQL database with RLS.
  - Edge Functions (Deno, TypeScript) for AI endpoints and RAG services.
  - Supabase Auth and Storage where needed.
- **AI & Search**:
  - **Google Gemini** models for generation, embeddings, and vision.
  - **pgvector** and custom SQL functions for **semantic and hybrid search** over BIS content.
  - **Firecrawl** for crawling BIS websites and feeding the RAG pipeline.

Think of it as a **PWA frontend** talking to a set of **Supabase edge APIs**, which in turn orchestrate **LLM calls, BIS content retrieval, and database operations**.

---

## 3. Frontend Application (`src/`)

### 3.1 Entry Points and Global Providers

- **`main.tsx`**
  - Bootstraps React and renders `<App />` into the DOM.
- **`App.tsx`**
  - Sets up **routing** using React Router.
  - Wraps the app in cross-cutting providers:
    - React Query `QueryClientProvider` for data fetching.
    - Theme provider (light/dark modes, Tailwind CSS variables).
    - Low-bandwidth / connectivity context providers.
    - Tooltip and toast providers (shadcn/ui + sonner).
  - Declares the main routes:
    - `/` → **`BISHome`** (primary landing and hub).
    - `/chat` → **`BISChat`** (RAG-based BIS chat assistant).
    - `/certification` → **`CertificationGuide`**.
    - `/standards` → **`StandardsExplorer`**.
    - `/about` → **`AboutBIS`**.
    - `/auth` → **`Auth`** (authentication flows, if enabled).
    - `/admin/crawl` → **`AdminCrawl`** (admin content ingestion UI).
    - `*` → **`NotFound`** (404 page).

### 3.2 Pages and Their Responsibilities (`src/pages/`)

- **`BISHome.tsx`**
  - The “home dashboard” for the product.
  - Composes many feature components:
    - Hero section and intro.
    - Online **Smart Safety Assistant** (LLM-backed).
    - **Offline Safety Assistant** for low-connectivity users.
    - **Household Scanner** entry point.
    - **Product search, comparison, and verification** tools.
    - **Risk meter, safety alerts, market risk map, community trust scores**.
    - Links to BIS certification guide, standards explorer, and product passport.

- **`BISChat.tsx`**
  - Dedicated **chat interface** for BIS questions.
  - Connects to the `rag-search` or `bis-chat` edge functions.
  - Shows:
    - Streaming AI responses.
    - Source citations.
    - Suggested follow-up questions.

- **`CertificationGuide.tsx`**
  - Explains **BIS certification schemes and processes** in a structured way.
  - Helps users understand when and how products must be certified.

- **`StandardsExplorer.tsx`**
  - UI for browsing standards by category, topic, or scheme.
  - Aims to make BIS standards less intimidating and more discoverable.

- **`AboutBIS.tsx`**
  - Static information about BIS and this application.

- **`ProductPassport.tsx` / `ProductPassportCard.tsx`**
  - Implements a “**product passport**” concept: a consolidated view of:
    - Product identity details.
    - Certification status.
    - Safety checklists and reviews.
  - Used from the home page and other product-centric views.

- **`AdminCrawl.tsx`**
  - Admin-only UI to:
    - Trigger crawls of BIS website pages via `crawl-bis` edge function.
    - Monitor ingestion status and results.
  - This is the **human control surface** for maintaining the RAG knowledge base.

### 3.3 Components (`src/components/`)

- **Layout & Navigation**
  - **`Header.tsx` / `BISHeader.tsx` / `Footer.tsx`**:
    - Top navigation, branding, links to main features.
    - May expose the low-bandwidth toggle and PWA install affordances.
  - **`NavLink.tsx`**:
    - Shared link component for consistent active state and styling.

- **Core Feature Components**
  - **`SmartSafetyAssistant.tsx`**
    - Frontend for the **online AI safety assistant**.
    - Talks to the `safety-assistant` edge function to get streaming guides:
      - Buying guides.
      - Required certifications.
      - Red-flag checks and safety tips.
  - **`OfflineSafetyAssistant.tsx`**
    - Uses `offlineKnowledgeBase` and `offlineKnowledgeMultilingual` to answer:
      - Common safety questions.
      - Product do’s and don’ts.
    - Works **even when the network is offline**.
  - **`HouseholdScanner.tsx`**
    - Entry point for scanning or selecting home products.
    - Coordinates with:
      - `analyze-product-image` (vision analysis).
      - `home-safety-report` (personalized report generation).
  - **Product/Funnel Components**
    - `ProductSearch`, `ProductComparison`, `ProductVerification`, `RiskMeter`, `MarketRiskMap`,
      `SafetyAlerts`, `CommunityTrustScore`, `ReportProduct`, `ProductPassportCard`, etc.
    - Together, these power:
      - Product lookup and verification against BIS info.
      - Visualization of **risk levels and alerts**.
      - Community-driven trust scores and feedback.

- **UI Library Integration**
  - **`components/ui/*`**
    - shadcn/ui primitives: buttons, inputs, dialogs, dropdowns, sheets, tabs, etc.
    - Provide consistent design tokens (radius, colors) driven by Tailwind CSS variables.
  - **Animations & Effects**
    - Framer Motion for subtle entrance/hover animations.
    - Tailwind keyframes (e.g., `fade-in`, `pulse-glow`) for lightweight effects.

### 3.4 Data and Offline Content (`src/data/`)

- **`products.ts`**
  - Local catalog of typical product categories and examples.
  - Backing data for product search, comparison, and risk visualization.

- **`offlineKnowledgeBase.ts`**
  - Core **offline BIS knowledge** in English:
    - Safety checklists.
    - Explanations of marks and schemes.
    - Consumer protection tips.

- **`offlineKnowledgeMultilingual.ts`**
  - Translations of the above content into **nine Indian languages**:
  - Enables offline experiences for users without stable internet or where BIS pages can’t be fetched live.

### 3.5 Hooks and Providers (`src/hooks/`)

- **`useOnlineStatus.ts`**
  - Detects **online/offline** status.
  - Drives UI changes: offline banners, disabled network-heavy features, etc.

- **`useLowBandwidth.tsx` + `LowBandwidthProvider`**
  - Detects low-bandwidth connections (2G/slow-2G).
  - Exposes context for:
    - Disabling animations and heavy visuals.
    - Switching to text-first layouts.
  - Also allows **manual override** via a toggle.

- **`useAuth.tsx`**
  - Wraps Supabase Auth for login/logout and user state.

- **`use-mobile.tsx`**
  - Responsive detection (mobile vs desktop) for layout decisions.

### 3.6 Supabase Integration (`src/integrations/supabase/`)

- **`client.ts`**
  - Creates a browser Supabase client using:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - Provides a **stub client** when env vars are missing, to avoid runtime crashes in unconfigured dev environments.

- **`types.ts`**
  - Generated `Database` TypeScript types from Supabase.
  - Strongly types:
    - Tables like `bis_knowledge_chunks`, `product_reports`, `product_reviews`, `safety_alerts`, `scan_history`.
    - RPC functions like `search_bis_chunks`.

---

## 4. Backend: Supabase Edge Functions (`supabase/functions/`)

Each folder under `supabase/functions/` exposes an HTTP endpoint (e.g., `rag-search`, `safety-assistant`) implemented with **Deno’s `serve`**. Most return **Server-Sent Events (SSE)** messages in an **OpenAI-compatible streaming format** to keep the frontend simple.

### 4.1 `rag-search`

- **Purpose**: Main **RAG chat endpoint** backing the `/chat` experience with **BIS-grounded answers and citations**.
- **Key responsibilities**:
  - Accepts chat history (`messages`) and optional settings (`topic_filter`, `language`, `simple_mode`).
  - Retrieves relevant chunks from `bis_knowledge_chunks` using:
    - `search_bis_chunks` RPC (full-text search).
    - Fallback ILIKE keyword search if RPC returns nothing.
  - Builds a rich **context block** and attaches it to a BIS-specific system prompt.
  - Streams Gemini-generated responses back as OpenAI-style SSE, including:
    - Answer text.
    - A `---SOURCES---` list based on retrieved URLs.
    - A `---CHUNK_META---` JSON block with metadata for the frontend.

### 4.2 `rag-ingest`

- **Purpose**: Bulk ingestion of documents into the **RAG knowledge base**.
- **What it does**:
  - Accepts a list of `{ url, title, content_type, content }` documents.
  - Splits them into ~500-token chunks (with overlap) via `chunkText`.
  - Generates embeddings using Gemini `text-embedding-004`.
  - Inserts chunk rows into `bis_knowledge_chunks` with:
    - `url`, `title`, `content_type`, `content`, `chunk_index`.
    - `embedding` vectors where available.
  - Continues even if some embedding calls fail, so ingestion is robust.

### 4.3 `crawl-bis`

- **Purpose**: Automated crawler to **populate and refresh** BIS knowledge.
- **Key flows**:
  - Uses Firecrawl to scrape BIS pages into markdown.
  - Categorizes each page into domain labels (certification, standards, consumer, labs, etc.).
  - Re-chunks page content and calls the same embedding pipeline as `rag-ingest`.
  - **Deletes old chunks** for a URL before inserting new ones to avoid duplication.
- **Usage**:
  - Triggered from the **`AdminCrawl`** frontend.
  - Returns detailed per-URL status and counts so admins can inspect failures.

### 4.4 `safety-assistant`

- **Purpose**: Focused **product safety guide generator** (“ISI Guardian”-style).
- **Behavior**:
  - Input: `{ query }` describing a product (e.g., “electric kettle”, “baby stroller”).
  - Output (streamed): Markdown with sections like:
    - Buying guide.
    - Required BIS certifications/marks.
    - Checks before buying.
    - Red flags and pro tips.
    - Quick verdict.
  - Uses a **fixed, domain-specific system prompt** and Gemini streaming to ensure safety-focused answers.

### 4.5 `bis-chat`

- **Purpose**: General **BIS smart assistant** with a **large built-in BIS knowledge prompt**, independent of the database.
- **Features**:
  - Strict **BIS-only scope**; must decline if user asks about non-BIS topics.
  - Always provides:
    - `---SOURCES---` with official BIS links.
    - `---SUGGESTIONS---` with exactly three follow-up questions.
  - Supports:
    - Topic filtering to prioritize specific BIS domains.
    - `simple_mode` for child-friendly, emoji-heavy explanations.
    - Answering in multiple languages while preserving technical terms in English.

### 4.6 `home-safety-report`

- **Purpose**: Generates a **personalized home safety analysis** and action plan.
- **Details**:
  - Input: `{ products, score }` representing household items and an overall score.
  - Output (streamed): Structured markdown including:
    - Safety summary.
    - Priority actions.
    - Per-product assessment.
    - Room-by-room tips.
    - Action plan checklist.
  - Designed to pair with the `HouseholdScanner` experience.

### 4.7 `analyze-product-image`

- **Purpose**: Vision-based **product safety and certification mark analysis**.
- **Details**:
  - Input: `{ imageUrl }` (data URL or remote).
  - Calls Gemini Vision to:
    - Detect product details (brand, category, marks).
    - Extract safety observations, certification numbers, and risk level.
  - Normalizes output into a JSON `analysis` object with fields like:
    - `productName`, `brand`, `category`, `certificationMarks`, `certificationNumber`, `riskLevel`, `summary`, `recommendation`.
  - If Gemini responds with mixed text + JSON, attempts to extract JSON; falls back gracefully if parsing fails.

### 4.8 `regenerate-embeddings`

- **Purpose**: Maintenance endpoint to **backfill or refresh embeddings**.
- **Details**:
  - Finds `bis_knowledge_chunks` rows where `embedding IS NULL`.
  - Generates embeddings in small batches with delays to respect rate limits.
  - Useful after:
    - Adding the `embedding` column.
    - Changing the embedding model.

---

## 5. Database and RAG Search Pipeline

### 5.1 Key Tables

- **`bis_knowledge_chunks`**
  - Stores chunked BIS website content with both:
    - PostgreSQL full-text search (`tsvector`).
    - `pgvector` embeddings for semantic search.
  - Core to the RAG pipeline used by `rag-search`.

- **`product_reports`**
  - User-submitted reports about **unsafe / counterfeit products**.
  - Supports workflows like **reporting suspicious items** from the UI.

- **`product_reviews`**
  - Stores product reviews, ratings, and complaint flags.
  - Powers **community trust scores** and review aggregations.

- **`safety_alerts`**
  - High-level alerts for categories or specific issues:
    - Severity, category, affected products, source, active flag, alert date.
  - Appears in the **Safety Alerts** and **Market Risk Map** UIs.

- **`scan_history`**
  - Stores structured results of image scans:
    - Product fields, risk level, key observations, and raw analysis JSON.
  - Allows users or admins to audit past scans and patterns.

### 5.2 Search and Retrieval Functions

- **`search_bis_chunks` (RPC)**
  - Exposed to edge functions as a **typed RPC**.
  - Provides full-text ranking and filtering over `bis_knowledge_chunks`.

- **Hybrid and Semantic Search (migrations)**
  - `search_bis_chunks_semantic`:
    - Pure vector similarity search (cosine distance) over embeddings.
  - `search_bis_chunks_hybrid`:
    - Combines FTS and semantic ranks using **Reciprocal Rank Fusion (RRF)**.
  - These power advanced retrieval strategies that can be used by current or future endpoints.

---

## 6. Configuration, Environment, and Tooling

### 6.1 TypeScript and Build Configuration

- **`tsconfig*.json`**
  - Main `tsconfig.json` plus `tsconfig.app.json` / `tsconfig.node.json`.
  - Uses TypeScript 5 with path alias:
    - `@/*` → `./src/*`.
  - Node config is stricter; app config is slightly relaxed for iteration speed.

- **`vite.config.ts`**
  - React + SWC plugin.
  - PWA setup via `VitePWA`:
    - Auto-updating service worker.
    - Manifest (name, icons, colors).
    - Workbox caching strategies (Google Fonts, static assets).
  - Dev server on port `8080`, host `::`.

### 6.2 Styling and Design System

- **`tailwind.config.ts`**
  - Dark mode enabled via class.
  - Rich theme exposing colors like:
    - `--primary`, `--secondary`, `--accent`, sidebar and card colors, etc.
  - Custom radii, animations, and keyframes for interactive UI.

- **`index.css`**
  - Tailwind base, components, utilities.
  - CSS variables for colors and typography.

- **`components.json` (shadcn)**
  - Configures:
    - Shadcn/ui components directory.
    - Tailwind plugin and style setup.
    - Aliases (`@/components`, `@/lib/utils`, `@/components/ui`, `@/hooks`).

### 6.3 Linting and Testing

- **ESLint (`eslint.config.js`)**
  - Flat config with:
    - `@eslint/js` + `typescript-eslint` recommended rules.
    - React Hooks and React Refresh plugins.
  - Applies to `**/*.{ts,tsx}`; ignores `dist`.

- **Tests (`vitest.config.ts`, `src/test/*`)**
  - Uses **Vitest** with `jsdom` environment.
  - `src/test/setup.ts`:
    - Adds `@testing-library/jest-dom` matchers.
    - Provides minimal browser polyfills (e.g., `matchMedia`).
  - Currently includes a simple example test; real feature tests can be added under `src/**/*.test.tsx`.

---

## 7. Cross-Cutting Design and Conventions

- **Streaming APIs everywhere**
  - All conversational endpoints stream SSE in an OpenAI-compatible format.
  - Frontend only needs **one generic streaming handler**.

- **Offline-first and bandwidth-aware**
  - Low-bandwidth detection + manual toggle.
  - Offline knowledge base for both English and multiple Indian languages.
  - Service worker-driven caching so users can install and use the app offline.

- **Supabase integration pattern**
  - Single shared client module for the browser.
  - Strong typing via generated `Database` types.
  - Clear separation between:
    - Frontend Supabase calls (for user-owned data like scans).
    - Edge function Supabase clients (for internal RAG pipeline operations).

- **Prompt and response contracts**
  - Edge functions use **strict prompt templates** and structured markers:
    - `---SOURCES---`, `---SUGGESTIONS---`, `---CHUNK_META---`.
  - Frontend parsing is resilient and predictable across assistants.

---

## 8. How to Extend the System

- **Add a new user-facing feature**
  - Create a new page under `src/pages` and route in `App.tsx`.
  - Build reusable components in `src/components` (prefer shadcn/ui primitives).
  - Use React Query and Supabase or edge functions to fetch data.

- **Extend the RAG pipeline**
  - Add new BIS content sources to `crawl-bis` or through `rag-ingest`.
  - Create migrations for new metadata fields or tables.
  - Wire up new search functions in SQL and call them from edge functions.

- **Introduce a new AI-powered tool**
  - Add a Supabase edge function (e.g., `supabase/functions/new-tool/index.ts`).
  - Use Gemini or other models with appropriate safety and scoping.
  - Expose the endpoint via a new frontend component or page.

This overview should give you a **map of every major feature and subsystem** in the repo. When you’re ready, you can drill into any page, component, or edge function and follow the patterns described here to safely extend or customize BIS-AI.

