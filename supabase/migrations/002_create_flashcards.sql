create table public.flashcards (
    id bigserial primary key,
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar not null check (source in ('ai-full', 'ai-edited', 'manual')),
    generation_id bigint references public.generations(id) on delete set null,
    user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index flashcards_user_id_idx on public.flashcards(user_id);
create index flashcards_generation_id_idx on public.flashcards(generation_id);

alter table public.flashcards enable row level security;

create policy "Users can view own flashcards"
    on public.flashcards for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert own flashcards"
    on public.flashcards for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update own flashcards"
    on public.flashcards for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete own flashcards"
    on public.flashcards for delete
    to authenticated
    using (auth.uid() = user_id);

-- Trigger for updating updated_at on flashcards
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_flashcards_updated_at
    before update on public.flashcards
    for each row
    execute function public.update_updated_at_column();

create trigger update_generations_updated_at
    before update on public.generations
    for each row
    execute function public.update_updated_at_column();
