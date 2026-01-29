-- Create the cars table to match the CSV import structure
create table if not exists public.cars (
  id text primary key,
  year integer,
  make text,
  model text,
  car_name text,
  weight numeric,
  weight_distribution numeric,
  drive_type text,
  pi_class text,
  default_pi integer,
  horsepower numeric,
  torque numeric,
  displacement numeric,
  gear_count integer,
  front_tire_width numeric,
  rear_tire_width numeric,
  rarity text,
  value numeric,
  boost text,
  stats jsonb
);

-- Enable Row Level Security (RLS)
alter table public.cars enable row level security;

-- Create policy to allow public read access
create policy "Allow public read access" on public.cars
  for select using (true);