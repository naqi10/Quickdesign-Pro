# Quickdesign Pro - AI Resume Generator

A Next.js app for generating polished resumes from raw client details, with AI-assisted parsing, rewriting, editable templates, PDF export, and local history.

## Features

- Smart Paste (`/api/parse-raw`) to convert raw WhatsApp/notes/CV text into structured form fields.
- AI Rewrite (`/api/rewrite`) to optimize summary, skills, and experience bullets.
- Inline editing in resume preview before export.
- Template-based rendering (`classic` included).
- PDF generation via Puppeteer.
- Local resume history save/load (`/api/save` with filesystem storage).
- Provider-flexible AI client with OpenAI-compatible APIs (Groq/Google Gemini support).

## Tech Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Zustand for client state
- Tailwind CSS
- OpenAI SDK (used against OpenAI-compatible providers)
- Puppeteer for PDF export

## Project Structure

- `app/` - routes and API endpoints
- `components/` - UI and editable preview components
- `templates/` - resume template renderers
- `lib/` - AI client, prompts, storage helpers, and shared utilities
- `store/` - Zustand store
- `data/` - local persisted resumes (gitignored)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` and configure an AI provider.

### Option A: Groq (recommended for quick testing)

```env
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_key
AI_MODEL=llama-3.1-8b-instant
AI_FALLBACK_MODELS=llama-3.1-70b-versatile
```

### Option B: Google AI Studio (Gemini)

```env
AI_PROVIDER=google
GOOGLE_API_KEY=your_google_ai_studio_key
AI_MODEL=gemini-2.0-flash-lite
AI_FALLBACK_MODELS=gemini-2.0-flash
```

Optional override:

```env
AI_BASE_URL=...
```

3. Run development server:

```bash
npm run dev
```

4. Open:

`http://localhost:3000`

## Build & Run

```bash
npm run build
npm run start
```

## Main API Endpoints

- `POST /api/parse-raw` - parse raw text into structured form data
- `POST /api/rewrite` - AI rewrite and generate resume payload
- `POST /api/generate-pdf` - generate downloadable PDF from template HTML
- `GET/POST/DELETE /api/save` - local resume history operations

## Notes

- `.env.local`, build output, local data, and temporary artifacts are ignored by git.
- If AI provider returns throttling (`429`), wait briefly and retry.
- If a model is unavailable (`404`), the app can fall back to configured models.

## License

Private/internal project. Add a license if you plan to open source this repository.
