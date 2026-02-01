create table public.generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    generated_count integer not null,
    accepted_unedited_count integer default 0,
    accepted_edited_count integer default 0,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index generations_user_id_idx on public.generations(user_id);

alter table public.generations enable row level security;

create policy "Users can view own generations"
    on public.generations for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert own generations"
    on public.generations for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update own generations"
    on public.generations for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete own generations"
    on public.generations for delete
    to authenticated
    using (auth.uid() = user_id);
