-- Uruchom w Supabase > SQL Editor.
-- Ogranicza dodawanie/edycję/usuwanie do konta administratora.
-- W tym projekcie konto administratora ma adres cybershield@op.pl.

alter table public.cards enable row level security;

drop policy if exists "Public can read cards" on public.cards;
drop policy if exists "Public can read cards_v2" on public.cards;
drop policy if exists "Authenticated users can insert cards" on public.cards;
drop policy if exists "Authenticated users can update cards" on public.cards;
drop policy if exists "Authenticated users can delete cards" on public.cards;
drop policy if exists "Admin can insert cards" on public.cards;
drop policy if exists "Admin can update cards" on public.cards;
drop policy if exists "Admin can delete cards" on public.cards;

create policy "Public can read cards"
on public.cards
for select
to anon, authenticated
using (true);

create policy "Admin can insert cards"
on public.cards
for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'cybershield@op.pl');

create policy "Admin can update cards"
on public.cards
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'cybershield@op.pl')
with check ((auth.jwt() ->> 'email') = 'cybershield@op.pl');

create policy "Admin can delete cards"
on public.cards
for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'cybershield@op.pl');
