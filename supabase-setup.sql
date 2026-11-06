-- Uruchom w Supabase > SQL Editor po zastąpieniu YOUR_ADMIN_EMAIL e-mailem
-- konta administratora, które utworzysz w Supabase Authentication.
-- To pozostawia publiczny odczyt, ale ogranicza zapis/usuwanie do tego e-maila.

alter table public.cards enable row level security;

drop policy if exists "Public can read cards" on public.cards;
drop policy if exists "Public can read cards_v2" on public.cards;
drop policy if exists "Authenticated users can insert cards" on public.cards;
drop policy if exists "Authenticated users can update cards" on public.cards;
drop policy if exists "Authenticated users can delete cards" on public.cards;

create policy "Public can read cards"
on public.cards
for select
to anon, authenticated
using (true);

create policy "Admin can insert cards"
on public.cards
for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL');

create policy "Admin can update cards"
on public.cards
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL')
with check ((auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL');

create policy "Admin can delete cards"
on public.cards
for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL');
