# Shreehari Export House — Staff Portal

## Deploy on Vercel

1. Import this repo and set the **Root Directory** to `export-flow-manager`.
2. Framework preset **TanStack Start** is detected automatically (`vercel.json`); build command is `npm run build`.
3. Add environment variables in the Vercel dashboard (Production + Preview):
   - `VITE_API_URL` — your production API (e.g. `https://hari.cavaluer.com`)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Deploy. Nitro builds a Vercel-compatible server bundle with zero extra output config.

Local dev: copy `.env.example` to `.env`, then `npm run dev`.