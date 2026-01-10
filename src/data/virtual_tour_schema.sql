-- ======================================================================
-- SUPABASE SCHEMA DESIGN FOR VIRTUAL TOUR
-- ======================================================================

-- 1. Table: Tours (Menyimpan data project/tour secara umum)
create table public.tours (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,         -- untuk URL friendly (misal: /tour/villa-canggu)
  description text,
  thumbnail_url text,                -- Cover image
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Table: Rooms (Menyimpan daftar ruangan/scene dalam satu tour)
-- Ini yang akan muncul di "demo-page__room-selector"
create table public.rooms (
  id uuid default gen_random_uuid() primary key,
  tour_id uuid references public.tours(id) on delete cascade not null,
  name text not null,                -- Misal: "Living Room", "Kitchen"
  slug text not null,                -- ID unik ruangan untuk navigasi (misal: living-room)
  image_url text not null,           -- URL Foto 360 (dari Supabase Storage)
  thumbnail_url text,                -- Optional: versi kecil untuk preview di selector
  initial_view_pitch float default 0, -- Posisi awal kamera (atas/bawah)
  initial_view_yaw float default 0,   -- Posisi awal kamera (kiri/kanan)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Constraint: slug ruangan harus unik dalam satu tour
  unique(tour_id, slug) 
);

-- 3. Table: Hotspots (Menyimpan titik interaktif dalam ruangan)
-- Ini untuk "pnlm-hotspot" (Icon info & Icon pindah ruangan)
create table public.hotspots (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  type text not null check (type in ('scene', 'info')), -- 'scene' = pindah, 'info' = popup teks
  
  -- Posisi Hotspot (Koordinat 360)
  pitch float not null, -- Posisi vertikal (-90 sampai 90)
  yaw float not null,   -- Posisi horizontal (-180 sampai 180)
  
  -- Konten Hotspot
  text text,            -- Label tooltip (misal: "Ke Dapur" atau "Info Marmer")
  icon text default 'info',  -- Icon type: 'info', 'arrow', 'door'
  
  -- Navigasi (Khusus tipe 'scene')
  target_room_id uuid references public.rooms(id), -- Ruangan tujuan (jika diklik pindah)
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ======================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Agar data bisa dibaca publik tapi hanya admin yang bisa edit
-- ======================================================================

-- Aktifkan RLS
alter table public.tours enable row level security;
alter table public.rooms enable row level security;
alter table public.hotspots enable row level security;

-- Policy: Semua orang (Public/Anon) boleh VIEW/READ data
create policy "Public tours are viewable by everyone" on public.tours for select using (true);
create policy "Public rooms are viewable by everyone" on public.rooms for select using (true);
create policy "Public hotspots are viewable by everyone" on public.hotspots for select using (true);

-- Policy: Hanya User Login (Authenticated) yang boleh INSERT/UPDATE/DELETE
-- (Nanti Anda login di dashboard untuk edit)
create policy "Authenticated users can manage tours" on public.tours for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage rooms" on public.rooms for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage hotspots" on public.hotspots for all using (auth.role() = 'authenticated');
