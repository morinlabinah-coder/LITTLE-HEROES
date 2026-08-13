# Brightcoders Academy full-stack site

## Structure

- `frontend/`: React + Vite frontend for Vercel
- `backend/`: Express API for Render
- `supabase/schema.sql`: PostgreSQL schema, login profiles, and policies

## Setup

1. Create a Supabase project and run `supabase/schema.sql` in its SQL Editor.
2. In Supabase Authentication, enable Email/Password and set the Site URL to the Vercel URL (use `http://localhost:5173` while testing).
3. Copy `backend/.env.example` to `backend/.env`. Paste Supabase's **Connection Pooler URI** (Transaction mode, port `6543`) into `DATABASE_URL`, then fill in the project URL and **service role key**. These backend secrets must never be sent to Vercel or committed.
4. Copy `frontend/.env.example` to `frontend/.env` and fill in the Render API URL, Supabase project URL, and public anonymous key. For Vercel, add these same values as environment variables. Never use the service-role key or database URL in the frontend.
5. Deploy `frontend/` as the Vercel project root. Deploy `backend/` to Render (the included `render.yaml` can be used). Set Render's `FRONTEND_URL` to the actual Vercel deployment URL.
6. Create the first staff user through `/login.html`, then run the commented `update` statement at the bottom of `supabase/schema.sql` with their user UUID to make them an admin.

## Local run

Run `pnpm install` then `pnpm dev` inside both `backend/` and `frontend/`. The React app starts at `http://localhost:5173`; set `VITE_API_URL` to `http://localhost:3000` in `frontend/.env`.
