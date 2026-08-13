create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'parent' check (role in ('parent', 'admin')),
  created_at timestamptz not null default now()
);

create table public.admission_applications (
  id bigint generated always as identity primary key,
  parent_name text not null,
  email text not null,
  learner_age integer not null check (learner_age between 2 and 18),
  phone text not null default '',
  grade_interest text not null default '',
  status text not null default 'new' check (status in ('new', 'contacted', 'enrolled', 'closed')),
  created_at timestamptz not null default now()
);

create table public.grades (
  id bigint generated always as identity primary key,
  name text not null unique,
  description text not null default '',
  created_at timestamptz not null default now()
);
create table public.streams (
  id bigint generated always as identity primary key,
  name text not null,
  grade_id bigint not null references public.grades(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(name, grade_id)
);
create table public.staff (
  id bigint generated always as identity primary key,
  first_name text not null, last_name text not null, email text not null unique,
  phone text not null default '', role text not null default 'Teacher',
  grade_id bigint references public.grades(id) on delete set null,
  stream_id bigint references public.streams(id) on delete set null,
  created_at timestamptz not null default now()
);
create table public.students (
  id bigint generated always as identity primary key,
  admission_no text not null unique, first_name text not null, last_name text not null,
  grade_id bigint references public.grades(id) on delete set null,
  stream_id bigint references public.streams(id) on delete set null,
  guardian_name text not null default '', guardian_phone text not null default '',
  created_at timestamptz not null default now()
);
create table public.fee_payments (
  id bigint generated always as identity primary key,
  student_id bigint not null references public.students(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  term text not null, academic_year integer not null, method text not null default 'Cash',
  reference text not null default '', paid_on date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.admission_applications enable row level security;
alter table public.grades enable row level security;
alter table public.streams enable row level security;
alter table public.staff enable row level security;
alter table public.students enable row level security;
alter table public.fee_payments enable row level security;
create policy "Users can view own profile" on public.profiles for select to authenticated using (auth.uid() = id);

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id) values (new.id); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- After creating your first staff account in Supabase Authentication, promote it:
-- update public.profiles set role = 'admin' where id = 'USER_UUID_HERE';
