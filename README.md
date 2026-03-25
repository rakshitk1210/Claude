# Claude UI Lab

A design and prototyping workspace for exploring **Claude-style chat and document experiences**—with a focus on iteration, versioning, and in-place editing rather than purely linear chat.

The project pairs a documented **design system** (colors, typography, assets) with **multiple UI iterations** and a **production-style React app** backed by serverless Anthropic API routes.

---

## What’s in the repo

| Area | Description |
|------|-------------|
| **`DESIGN.md`** | Design system spec: brand palette, semantic tokens, typography (SF Pro, Test Tiempos Headline, SF Compact Rounded), and asset usage. |
| **`problem.md`** | Product framing: “From Chat to Canvas”—why linear chat breaks refinement, and HMWs around versions and selective editing. |
| **`index.html`** | Standalone reference UI at the repository root. |
| **`iterations/v1`–`v11`** | Earlier HTML/CSS/JS explorations preserved for comparison. |
| **`iterations/v12`** | Current **React 19 + TypeScript + Vite** app (`npm run dev` / `npm run build`). |
| **`api/`** | Vercel serverless handlers that call the Anthropic API (`chat`, `document`, `inline-edit`, `document-revise`). |

---

## Prerequisites

- **Node.js** 20+ (recommended for Vite and modern tooling)
- **npm**
- **`ANTHROPIC_API_KEY`** — required for API routes (and for local API dev in v12 if you use the bundled server)

---

## Quick start

### Root install (Vercel-style build)

From the repository root:

```bash
npm install
cd iterations/v12 && npm install && cd ../..
```

### Run the v12 app locally

```bash
cd iterations/v12
cp .env.example .env   # add ANTHROPIC_API_KEY in .env
npm run dev
```

This runs the Vite frontend together with the local chat API (see `package.json` scripts: `dev:api` + `dev:vite`).

### Build (same as deployment)

```bash
npm run build
```

This builds **`iterations/v12`** via Vite and TypeScript (`tsc -b && vite build`). Output layout follows your Vite config under `iterations/v12`.

---

## Deployment

The repo is set up for **[Vercel](https://vercel.com/)** (`vercel.json`):

- Installs root dependencies and **`iterations/v12`** dependencies
- Builds from **`iterations/v12`**
- Exposes **`api/*.ts`** as serverless functions with extended timeouts where configured

Set **`ANTHROPIC_API_KEY`** in the Vercel project environment variables.

---

## Project layout (abbreviated)

```
├── api/                 # Serverless endpoints (Anthropic)
├── assets/              # Shared media / references
├── iterations/
│   ├── v1 … v11/        # Historical static prototypes
│   └── v12/             # React + Vite source app
├── DESIGN.md
├── problem.md
├── index.html
├── package.json         # Root scripts & shared deps
└── vercel.json
```

---

## Fonts

Licensed/local fonts live in the repo (for example **`Test Tiempos Headline/`** and **`SF-Compact-Rounded-Regular.otf`**). See **`DESIGN.md`** for when to use each face.

---

## License & credits

Private project (`"private": true` in `package.json`). UI and patterns are **inspired by Claude / Anthropic** for prototyping and research—not an official Anthropic product.
