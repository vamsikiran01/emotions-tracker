# Emo Track: Mental Health Detection & Sentiment Analysis from Journal Entries

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_14-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini_Flash-8E75B2?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple)](https://web.dev/progressive-web-apps/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)

> **A clinical-grade, privacy-first affective computing Progressive Web Application (PWA)** that performs granular emotion detection, longitudinal psychological tracking, and crisis safety flagging from multimodal text and voice journal entries.

---

## 🌟 Key Innovations & Architecture

Emo Track implements a **Hybrid Dual-Engine Architecture** that unites deterministic, client-side Natural Language Processing with edge-hosted Large Language Model (LLM) function calling.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER INPUT & CAPTURE                            │
│    • Rich Textarea with Lexical Filter (englishWords.ts)               │
│    • Web Audio API Live Waveform Visualizer + MediaRecorder            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   DUAL-ENGINE INFERENCE PIPELINE                       │
│                                                                        │
│   [Engine A: Client-Side NLP (Compromise.js)]                          │
│   • Lemmatization (Infinitive verbs, singular nouns)                   │
│   • Single-document TF-IDF keyword extraction                          │
│   • Bigram & Negation context matching                                 │
│   • CBT Cognitive Distortion detection (All-or-Nothing, Catastrophizing)│
│   • 3D Valence-Arousal-Dominance (VAD) Dimensional Model               │
│                                                                        │
│   [Engine B: Edge LLM Structured Inference]                            │
│   • Supabase Deno Edge Function (`analyze-emotion`)                    │
│   • Google Gemini 3 Flash Preview (Temperature: 0)                     │
│   • Strict JSON schema tool calling (Function Calling)                 │
│   • Fallback: Deterministic offline rule engine                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     DATA PERSISTENCE & ANALYTICS                       │
│    • PostgreSQL with Row Level Security (RLS) policies                 │
│    • Private Storage Buckets (folder-level user isolation)            │
│    • Recharts Longitudinal Mood Trajectory & Context Trigger Tagging   │
│    • 1-Click Clinical Therapist Summary (Print / PDF Export)           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Dataset Benchmark Integration

The classification taxonomy is calibrated against the **51,000+ entry Kaggle benchmark**:
* **Source:** [Sentiment Analysis for Mental Health (Kaggle)](https://www.kaggle.com/datasets/suchintikasarkar/sentiment-analysis-for-mental-health)
* **Status Categories:**
  1. `Normal`
  2. `Depression`
  3. `Suicidal`
  4. `Anxiety`
  5. `Stress`
  6. `Bipolar`
  7. `Personality disorder`

---

## 🚀 Core Features

* **Multimodal Journaling:** Write freely or record voice entries with real-time audio waveform feedback via the browser's native `AudioContext` and `AnalyserNode`.
* **Voice-to-Text via Gemini 2.5 Flash:** Audio recordings are processed through a serverless Edge Function with zero client API key exposure.
* **Explainable AI (XAI) Word Heatmap:** Interactive token highlighting that visually explains which phrases influenced the emotional classification.
* **Cognitive Behavioral Therapy (CBT) Detection:** Flags common cognitive distortions (*Overgeneralization*, *Catastrophizing*, *Emotional Reasoning*) with gentle reframing prompts.
* **Valence-Arousal-Dominance (VAD) Affective Gauge:** Multi-axis measurement of emotional pleasantness, energy, and agency.
* **Emergency Crisis Safety Protocol:** Automatically identifies distress indicators and opens an immediate crisis assistance drawer with 24/7 direct-dial hotlines (India Tele-MANAS `14416`, US `988`, UK `111`) and a 4-7-8 calming breath exercise.
* **Longitudinal Analytics:** Tracks consecutive day streaks, emotional stability scores, weekly dominant moods, and mood valence trajectories via Recharts.
* **1-Click Clinical PDF Export:** Generates clean, printer-friendly summaries for therapists or clinical reviews.
* **PWA Offline Support:** Installable as a native app on iOS, Android, and Desktop with offline shell caching.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript | Vite 5 bundler with SWC compiler |
| **Design System** | Tailwind CSS 3.4, shadcn/ui | Radix UI primitives, Lucide React icons |
| **Client NLP** | Compromise.js (`compromise`) | Tokenization, POS tagging, lemmatization |
| **Data Viz** | Recharts 2.15 | Responsive SVG bar and area charts |
| **Backend** | Supabase Edge Functions | Deno TypeScript runtime |
| **Database** | PostgreSQL | PostgREST 14.1, Row Level Security (RLS) |
| **Object Storage**| Supabase Storage | `journal-audio` private bucket |
| **AI LLM** | Google Gemini Flash | Gemini 3 Flash Preview & Gemini 2.5 Flash |
| **Notifications** | Resend API | Transactional login alerts & daily digests |
| **Hosting** | Vercel / Lovable | Single Page Application (SPA) with rewrite rules |

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** or **bun**

### 1. Clone & Install
```bash
git clone https://github.com/vamsikiran01/emotions-tracker.git
cd emotions-tracker
npm install
```

### 2. Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🔒 Security & Privacy

* **Row Level Security (RLS):** Enforced across all PostgreSQL tables. Every query verifies `auth.uid() = user_id`.
* **Zero Client-Side Keys:** All third-party AI keys reside exclusively in secure serverless Deno Edge Function environments.
* **Encrypted Voice Storage:** User audio recordings are protected behind folder-level authorization policies and distributed through signed, short-lived URLs.

---

## 📄 License & Academic Disclaimer
* Developed as an academic final-year capstone project in Affective Computing and Natural Language Processing.
* **Disclaimer:** Emo Track is an informational self-reflection tool and is not a substitute for professional clinical diagnosis or psychiatric therapy.
