create table public.generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

create index generation_error_logs_user_id_idx on public.generation_error_logs(user_id);

alter table public.generation_error_logs enable row level security;

create policy "Users can view own error logs"
    on public.generation_error_logs for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert own error logs"
    on public.generation_error_logs for insert
    to authenticated
    with check (auth.uid() = user_id);
