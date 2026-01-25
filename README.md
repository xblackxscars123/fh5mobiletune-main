# FH5 Mobile Tune

Vite + React + TypeScript app for browsing FH5 car data and generating tune guidance.

## Requirements

- Node.js 18+

## Setup

```sh
npm install
```

## Environment variables

Create a `.env` file in the repo root (copy from `.env.example`).

Required:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Development

```sh
npm run dev
```

## Production build

```sh
npm run ci
```

Serve the built output locally:

```sh
npm run preview
```

## Deployment

This is a static Vite app.

- **Build command**: `npm run build`
- **Publish directory**: `dist`

If deploying under a subpath (e.g. GitHub Pages), set Vite `base` in `vite.config.ts`.
