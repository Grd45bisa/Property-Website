-- ======================================================================
-- SUPABASE SCHEMA FOR VIRTUAL TOUR (PROPVERSE)
-- ======================================================================

-- 1. Create Tables
-- ----------------------------------------------------------------------

-- Table: Tours (Project Header)
create table public.tours (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null, -- Link to owner
  title text not null,
  slug text not null,
  description text,
  thumbnail_url text,
  start_room_id uuid, -- ID of the initial scene to load
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, slug)
);

-- Table: Rooms (Scenes / Panoramas)
create table public.rooms (
  id uuid default gen_random_uuid() primary key,
  tour_id uuid references public.tours(id) on delete cascade not null,
  name text not null,          -- e.g., "Living Room"
  slug text not null,          -- e.g., "living-room"
  image_url text not null,     -- URL of the 360 image in Storage
  thumbnail_url text,          -- Optimize preview
  initial_view_pitch float default 0,
  initial_view_yaw float default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(tour_id, slug)
);

-- Table: Hotspots (Interactions)
create table public.hotspots (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  type text not null check (type in ('scene', 'info')),
  
  -- Coordinates
  pitch float not null,
  yaw float not null,
  
  -- Content
  text text,
  icon text default 'info', -- 'info', 'door', 'arrow'
  
  -- Navigation (only for type='scene')
  target_room_id uuid references public.rooms(id) on delete set null,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add Foreign Key for start_room_id in tours (circular dependency solved by adding later or allowing null)
alter table public.tours 
  add constraint fk_tours_start_room 
  foreign key (start_room_id) references public.rooms(id) on delete set null;

-- ======================================================================
-- 2. Row Level Security (RLS)
-- ======================================================================

-- Enable RLS
alter table public.tours enable row level security;
alter table public.rooms enable row level security;
alter table public.hotspots enable row level security;

-- Policies for Tours
create policy "Tours are viewable by everyone" 
  on public.tours for select using (true);

create policy "Users can insert their own tours" 
  on public.tours for insert with check (auth.uid() = user_id);

create policy "Users can update their own tours" 
  on public.tours for update using (auth.uid() = user_id);

create policy "Users can delete their own tours" 
  on public.tours for delete using (auth.uid() = user_id);

-- Policies for Rooms (Inherit permission from Tour)
create policy "Rooms are viewable by everyone" 
  on public.rooms for select using (true);

create policy "Users can manage rooms of their tours" 
  on public.rooms for all using (
    exists (
      select 1 from public.tours
      where tours.id = rooms.tour_id
      and tours.user_id = auth.uid()
    )
  );

-- Policies for Hotspots (Inherit permission from Room -> Tour)
create policy "Hotspots are viewable by everyone" 
  on public.hotspots for select using (true);

create policy "Users can manage hotspots of their tours" 
  on public.hotspots for all using (
    exists (
      select 1 from public.rooms
      join public.tours on tours.id = rooms.tour_id
      where rooms.id = hotspots.room_id
      and tours.user_id = auth.uid()
    )
  );

-- ======================================================================
-- 3. Storage Bucket Setup (Run this in SQL Editor as well)
-- ======================================================================

-- Insert a new bucket for virtual tours if it doesn't exist
insert into storage.buckets (id, name, public)
values ('virtual-tours', 'virtual-tours', true)
on conflict (id) do nothing;

-- Policy to allow public access to images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'virtual-tours' );

-- Policy to allow authenticated users to upload images
create policy "Authenticated Users Upload"
  on storage.objects for insert
  with check ( bucket_id = 'virtual-tours' and auth.role() = 'authenticated' );

-- Policy to allow users to update/delete their own images
create policy "User Update Own Images"
  on storage.objects for update
  using ( bucket_id = 'virtual-tours' and auth.uid() = owner );

create policy "User Delete Own Images"
  on storage.objects for delete
  using ( bucket_id = 'virtual-tours' and auth.uid() = owner );
