alter table public.records
add column if not exists result_type text not null default 'CLEAR';

alter table public.records
add column if not exists clear_grade text;

alter table public.records
add column if not exists advisor_profile_id text;

comment on column public.records.result_type is 'CLEAR | BANKRUPT';
comment on column public.records.clear_grade is 'S | A | B | C | null for BANKRUPT';

alter table public.player_accounts
add column if not exists user_type text not null default 'general';

comment on column public.player_accounts.user_type is 'student | teacher | general';
