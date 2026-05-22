create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint subjects_name_not_empty check (length(trim(name)) > 0),
  constraint subjects_user_name_unique unique (user_id, name)
);

create table if not exists public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  week_start date not null,
  week_end date not null,
  created_at timestamptz not null default now(),
  constraint weekly_plans_valid_range check (week_end >= week_start),
  constraint weekly_plans_user_week_unique unique (user_id, week_start)
);

create table if not exists public.weekly_plan_items (
  id uuid primary key default gen_random_uuid(),
  weekly_plan_id uuid not null references public.weekly_plans(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  trail_number integer not null,
  topics text[] not null default '{}',
  studied boolean not null default false,
  created_at timestamptz not null default now(),
  constraint weekly_plan_items_trail_non_negative check (trail_number >= 0),
  constraint weekly_plan_items_topics_not_empty check (cardinality(topics) > 0)
);

create table if not exists public.daily_study_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  trail_number integer not null,
  topics text[] not null default '{}',
  study_date date not null,
  total_questions integer not null,
  correct_questions integer not null,
  wrong_questions integer not null,
  accuracy_percentage numeric(5,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  constraint daily_logs_trail_non_negative check (trail_number >= 0),
  constraint daily_logs_questions_non_negative check (
    total_questions >= 0 and correct_questions >= 0 and wrong_questions >= 0
  ),
  constraint daily_logs_questions_total_matches check (total_questions = correct_questions + wrong_questions),
  constraint daily_logs_has_questions check (total_questions > 0)
);

create index if not exists subjects_user_id_idx on public.subjects(user_id);
create index if not exists weekly_plans_user_week_idx on public.weekly_plans(user_id, week_start desc);
create index if not exists weekly_plan_items_plan_trail_idx on public.weekly_plan_items(weekly_plan_id, trail_number);
create index if not exists daily_logs_user_date_idx on public.daily_study_logs(user_id, study_date desc);
create index if not exists daily_logs_subject_idx on public.daily_study_logs(subject_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.set_daily_log_accuracy()
returns trigger
language plpgsql
as $$
begin
  if new.total_questions <= 0 then
    new.accuracy_percentage := 0;
  else
    new.accuracy_percentage := round((new.correct_questions::numeric / new.total_questions::numeric) * 100, 2);
  end if;
  return new;
end;
$$;

drop trigger if exists set_daily_log_accuracy on public.daily_study_logs;
create trigger set_daily_log_accuracy
before insert or update of total_questions, correct_questions, wrong_questions
on public.daily_study_logs
for each row execute procedure public.set_daily_log_accuracy();

alter table public.users enable row level security;
alter table public.subjects enable row level security;
alter table public.weekly_plans enable row level security;
alter table public.weekly_plan_items enable row level security;
alter table public.daily_study_logs enable row level security;

create policy "Users can read own profile"
on public.users for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can read own subjects"
on public.subjects for select
using (auth.uid() = user_id);

create policy "Users can insert own subjects"
on public.subjects for insert
with check (auth.uid() = user_id);

create policy "Users can update own subjects"
on public.subjects for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own subjects"
on public.subjects for delete
using (auth.uid() = user_id);

create policy "Users can read own weekly plans"
on public.weekly_plans for select
using (auth.uid() = user_id);

create policy "Users can insert own weekly plans"
on public.weekly_plans for insert
with check (auth.uid() = user_id);

create policy "Users can update own weekly plans"
on public.weekly_plans for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own weekly plans"
on public.weekly_plans for delete
using (auth.uid() = user_id);

create policy "Users can read own weekly plan items"
on public.weekly_plan_items for select
using (
  exists (
    select 1 from public.weekly_plans wp
    where wp.id = weekly_plan_id and wp.user_id = auth.uid()
  )
);

create policy "Users can insert own weekly plan items"
on public.weekly_plan_items for insert
with check (
  exists (
    select 1 from public.weekly_plans wp
    where wp.id = weekly_plan_id and wp.user_id = auth.uid()
  )
  and exists (
    select 1 from public.subjects s
    where s.id = subject_id and s.user_id = auth.uid()
  )
);

create policy "Users can update own weekly plan items"
on public.weekly_plan_items for update
using (
  exists (
    select 1 from public.weekly_plans wp
    where wp.id = weekly_plan_id and wp.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.weekly_plans wp
    where wp.id = weekly_plan_id and wp.user_id = auth.uid()
  )
  and exists (
    select 1 from public.subjects s
    where s.id = subject_id and s.user_id = auth.uid()
  )
);

create policy "Users can delete own weekly plan items"
on public.weekly_plan_items for delete
using (
  exists (
    select 1 from public.weekly_plans wp
    where wp.id = weekly_plan_id and wp.user_id = auth.uid()
  )
);

create policy "Users can read own daily logs"
on public.daily_study_logs for select
using (auth.uid() = user_id);

create policy "Users can insert own daily logs"
on public.daily_study_logs for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.subjects s
    where s.id = subject_id and s.user_id = auth.uid()
  )
);

create policy "Users can update own daily logs"
on public.daily_study_logs for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.subjects s
    where s.id = subject_id and s.user_id = auth.uid()
  )
);

create policy "Users can delete own daily logs"
on public.daily_study_logs for delete
using (auth.uid() = user_id);
