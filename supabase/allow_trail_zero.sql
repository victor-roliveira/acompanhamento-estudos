alter table public.weekly_plan_items
drop constraint if exists weekly_plan_items_trail_positive;

alter table public.weekly_plan_items
drop constraint if exists weekly_plan_items_trail_non_negative;

alter table public.weekly_plan_items
add constraint weekly_plan_items_trail_non_negative
check (trail_number >= 0);

alter table public.daily_study_logs
drop constraint if exists daily_logs_trail_positive;

alter table public.daily_study_logs
drop constraint if exists daily_logs_trail_non_negative;

alter table public.daily_study_logs
add constraint daily_logs_trail_non_negative
check (trail_number >= 0);
