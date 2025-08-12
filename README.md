# Creative Agents (Vite + React) Starter

This project is a clean React + Tailwind starter that mirrors the requested routes and shared UI to help you bootstrap quickly in Lovable. Note: Lovable does not support Next.js directly, so this starter uses Vite + React Router.

## Development
- npm i
- npm run dev
- App runs at http://localhost:3000

## Build
- npm run build
- npm run preview

## Routing
Implemented routes with placeholder UIs:
- /, /dashboard, /builder, /agents, /marketplace, /agents/:id, /runs/:id, /pricing, /settings, /admin

## API Namespace
Vite doesn’t provide server-side API routes. A placeholder is available at /api/health.json (served from public/). For serverless/API needs, use Supabase Edge Functions or deploy a backend.

## Shared UI
Using shadcn-ui components already included: Button, Card, Badge, Table, Tabs, Toast. A Modal wrapper is provided at src/components/ui/modal.tsx (built on Dialog).

## ESLint & Prettier
- ESLint is configured (see eslint.config.js)
- Prettier is configured via .prettierrc and .prettierignore

## Environment Variables (.env.example)
Included a .env.example for a Next.js stack reference. In Lovable there are no runtime .env files; prefer Supabase secrets or let users enter publishable keys client-side if absolutely needed.

## Next.js Repository
If you want a full Next.js (App Router) repo with Prisma/Postgres, Auth.js, Stripe, BullMQ (Redis), and S3 uploads, I can generate a GitHub-ready template and share instructions to clone locally. 
