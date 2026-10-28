-- v2.2: kozos felretett polc. Egyszer kell lefuttatni a Supabase SQL Editorban.
-- Amig nincs lefuttatva, a PDA eszkozonkent, helyben tarolja a felretett termekeket.

create table if not exists public.rk_parked (
  key text primary key,                 -- termek kulcs (SKU elso resze, vezeto nullak nelkul)
  n int not null default 0 check (n >= 0),
  device text,
  ts timestamptz not null default now()
);

alter table public.rk_parked enable row level security;
drop policy if exists rk_parked_read on public.rk_parked;
create policy rk_parked_read on public.rk_parked for select to anon, authenticated using (true);

-- darabszam valtoztatasa (+1 felretesz, -n levesz a polcrol); 0-nal a sor torlodik
create or replace function public.rk_park(p_key text, p_delta int, p_device text)
returns json language plpgsql security definer set search_path = public as $$
declare v int;
begin
  insert into rk_parked(key, n, device, ts) values (p_key, greatest(0, p_delta), p_device, now())
  on conflict (key) do update set n = greatest(0, rk_parked.n + p_delta), device = p_device, ts = now()
  returning n into v;
  if v = 0 then delete from rk_parked where key = p_key; end if;
  return json_build_object('ok', true, 'n', v);
end $$;
grant execute on function public.rk_park(text, int, text) to anon, authenticated;

-- elo frissites a tobbi eszkozon
do $$ begin
  alter publication supabase_realtime add table public.rk_parked;
exception when duplicate_object then null; end $$;
