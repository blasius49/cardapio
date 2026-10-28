# Supabase + Vercel setup
1. Create a Supabase project; open **SQL Editor**, paste and run `supabase/schema.sql`.
2. In Supabase **Connect**, copy the Postgres connection string (use the transaction pooler if required by your Vercel network; make sure the password is URL-encoded).
3. Set `DATABASE_URL` in Vercel → Project → Settings → Environment Variables (Production and Preview as needed). Never prefix it with NEXT_PUBLIC_.
4. Set a strong unique `ADMIN_PIN` in Vercel. The existing UI expects an admin PIN. **Important:** the PIN is currently a basic demo auth mechanism, not suitable for sensitive production operations.
5. Redeploy and visit `/api/health` for {"ok":true}. The app automatically seeds sample menu data on its first `/api/menu` request; the existing seed also adds a demonstration order.
6. Product names, business contact details and prices are currently demonstration content; customize before presenting as a real pizzeria.
Do not run this on a shared production database with unrelated existing tables.
