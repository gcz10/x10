# 10xCards - Schemat Bazy Danych

## 1. Diagram relacji (text-based)

```
┌─────────────────────┐
│     auth.users       │
│  (Supabase Auth)     │
│─────────────────────│
│  id (uuid) PK       │
│  email               │
│  ...                 │
└──────────┬──────────┘
           │
           │ 1:N
           │
     ┌─────┼──────────────────────────┐
     │     │                          │
     ▼     ▼                          ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐
│   generations     │  │   flashcards     │  │  generation_error_logs   │
│──────────────────│  │──────────────────│  │──────────────────────────│
│ id (PK)          │  │ id (PK)          │  │ id (PK)                  │
│ user_id (FK)─────│──│ user_id (FK)─────│  │ user_id (FK)             │
│ model            │  │ front            │  │ model                    │
│ generated_count  │  │ back             │  │ source_text_hash         │
│ accepted_*_count │  │ source           │  │ source_text_length       │
│ source_text_hash │  │ generation_id(FK)│──│ error_code               │
│ source_text_len  │  │ created_at       │  │ error_message            │
│ generation_dur   │  │ updated_at       │  │ created_at               │
│ created_at       │  └──────────────────┘  └──────────────────────────┘
│ updated_at       │          │
└──────────────────┘          │
         │                    │
         │       1:N          │
         └────────────────────┘
           generations → flashcards
```

## 2. Tabele

### 2.1. Tabela `generations`

Przechowuje informacje o każdej sesji generowania fiszek przez AI.

```sql
CREATE TABLE generations (
    id              bigserial PRIMARY KEY,
    user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    model           varchar NOT NULL,
    generated_count integer NOT NULL,
    accepted_unedited_count integer NOT NULL DEFAULT 0,
    accepted_edited_count   integer NOT NULL DEFAULT 0,
    source_text_hash   varchar NOT NULL,
    source_text_length integer NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000),
    generation_duration integer NOT NULL, -- czas generowania w milisekundach
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);
```

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|-------------|------|
| `id` | `bigserial` | PK | Unikalny identyfikator generacji |
| `user_id` | `uuid` | NOT NULL, FK → auth.users, ON DELETE CASCADE | Właściciel generacji |
| `model` | `varchar` | NOT NULL | Nazwa modelu AI (np. google/gemini-2.0-flash-001) |
| `generated_count` | `integer` | NOT NULL | Liczba wygenerowanych propozycji fiszek |
| `accepted_unedited_count` | `integer` | NOT NULL, DEFAULT 0 | Liczba zaakceptowanych bez edycji |
| `accepted_edited_count` | `integer` | NOT NULL, DEFAULT 0 | Liczba zaakceptowanych po edycji |
| `source_text_hash` | `varchar` | NOT NULL | Hash tekstu źródłowego (SHA-256) |
| `source_text_length` | `integer` | NOT NULL, CHECK 1000-10000 | Długość tekstu źródłowego w znakach |
| `generation_duration` | `integer` | NOT NULL | Czas generowania w milisekundach |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | Data utworzenia rekordu |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | Data ostatniej modyfikacji |

### 2.2. Tabela `flashcards`

Przechowuje fiszki użytkowników - zarówno wygenerowane przez AI, jak i utworzone ręcznie.

```sql
CREATE TABLE flashcards (
    id              bigserial PRIMARY KEY,
    front           varchar(200) NOT NULL,
    back            varchar(500) NOT NULL,
    source          varchar NOT NULL CHECK (source IN ('ai-full', 'ai-edited', 'manual')),
    generation_id   bigint REFERENCES generations(id) ON DELETE SET NULL,
    user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);
```

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|-------------|------|
| `id` | `bigserial` | PK | Unikalny identyfikator fiszki |
| `front` | `varchar(200)` | NOT NULL | Przód fiszki (pytanie), max 200 znaków |
| `back` | `varchar(500)` | NOT NULL | Tył fiszki (odpowiedź), max 500 znaków |
| `source` | `varchar` | NOT NULL, CHECK IN ('ai-full', 'ai-edited', 'manual') | Źródło fiszki |
| `generation_id` | `bigint` | FK → generations, ON DELETE SET NULL | Powiązanie z sesją generowania (null dla ręcznych) |
| `user_id` | `uuid` | NOT NULL, FK → auth.users, ON DELETE CASCADE | Właściciel fiszki |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | Data utworzenia |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | Data ostatniej modyfikacji |

**Wartości `source`:**
- `ai-full` - fiszka zaakceptowana bez zmian z propozycji AI
- `ai-edited` - fiszka zaakceptowana po edycji propozycji AI
- `manual` - fiszka utworzona ręcznie przez użytkownika

### 2.3. Tabela `generation_error_logs`

Przechowuje logi błędów generowania fiszek (do celów diagnostycznych).

```sql
CREATE TABLE generation_error_logs (
    id                  bigserial PRIMARY KEY,
    user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    model               varchar NOT NULL,
    source_text_hash    varchar NOT NULL,
    source_text_length  integer NOT NULL,
    error_code          varchar NOT NULL,
    error_message       text NOT NULL,
    created_at          timestamptz NOT NULL DEFAULT now()
);
```

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|-------------|------|
| `id` | `bigserial` | PK | Unikalny identyfikator logu |
| `user_id` | `uuid` | NOT NULL, FK → auth.users, ON DELETE CASCADE | Użytkownik, którego dotyczy błąd |
| `model` | `varchar` | NOT NULL | Nazwa modelu AI |
| `source_text_hash` | `varchar` | NOT NULL | Hash tekstu źródłowego |
| `source_text_length` | `integer` | NOT NULL | Długość tekstu źródłowego |
| `error_code` | `varchar` | NOT NULL | Kod błędu (np. TIMEOUT, RATE_LIMIT, INVALID_RESPONSE) |
| `error_message` | `text` | NOT NULL | Szczegółowy komunikat błędu |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | Data wystąpienia błędu |

## 3. Indeksy

```sql
-- generations: szybkie wyszukiwanie po użytkowniku
CREATE INDEX idx_generations_user_id ON generations(user_id);

-- flashcards: szybkie wyszukiwanie po użytkowniku
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);

-- flashcards: szybkie wyszukiwanie po generacji
CREATE INDEX idx_flashcards_generation_id ON flashcards(generation_id);

-- generation_error_logs: szybkie wyszukiwanie po użytkowniku
CREATE INDEX idx_generation_error_logs_user_id ON generation_error_logs(user_id);
```

## 4. Polityki Row Level Security (RLS)

Każdy użytkownik ma dostęp wyłącznie do swoich danych. RLS jest włączony na wszystkich tabelach.

### 4.1. Polityki dla `generations`

```sql
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Użytkownik widzi tylko swoje generacje
CREATE POLICY "Users can view own generations"
    ON generations FOR SELECT
    USING (auth.uid() = user_id);

-- Użytkownik może tworzyć generacje tylko dla siebie
CREATE POLICY "Users can insert own generations"
    ON generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Użytkownik może aktualizować tylko swoje generacje
CREATE POLICY "Users can update own generations"
    ON generations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

### 4.2. Polityki dla `flashcards`

```sql
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Użytkownik widzi tylko swoje fiszki
CREATE POLICY "Users can view own flashcards"
    ON flashcards FOR SELECT
    USING (auth.uid() = user_id);

-- Użytkownik może tworzyć fiszki tylko dla siebie
CREATE POLICY "Users can insert own flashcards"
    ON flashcards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Użytkownik może aktualizować tylko swoje fiszki
CREATE POLICY "Users can update own flashcards"
    ON flashcards FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Użytkownik może usuwać tylko swoje fiszki
CREATE POLICY "Users can delete own flashcards"
    ON flashcards FOR DELETE
    USING (auth.uid() = user_id);
```

### 4.3. Polityki dla `generation_error_logs`

```sql
ALTER TABLE generation_error_logs ENABLE ROW LEVEL SECURITY;

-- Użytkownik widzi tylko swoje logi błędów
CREATE POLICY "Users can view own error logs"
    ON generation_error_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Użytkownik może tworzyć logi błędów tylko dla siebie
CREATE POLICY "Users can insert own error logs"
    ON generation_error_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

## 5. Trigger automatycznej aktualizacji `updated_at`

```sql
-- Funkcja do automatycznej aktualizacji kolumny updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger dla generations
CREATE TRIGGER update_generations_updated_at
    BEFORE UPDATE ON generations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger dla flashcards
CREATE TRIGGER update_flashcards_updated_at
    BEFORE UPDATE ON flashcards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 6. Uwagi dodatkowe

- **Kaskadowe usuwanie:** Usunięcie użytkownika z `auth.users` automatycznie usuwa wszystkie jego generacje, fiszki i logi błędów (ON DELETE CASCADE).
- **SET NULL dla generation_id:** Usunięcie generacji nie usuwa powiązanych fiszek - zamiast tego `generation_id` jest ustawiany na NULL (ON DELETE SET NULL). Dzięki temu fiszki przetrwają nawet po usunięciu danych o generacji.
- **Hash tekstu źródłowego:** Przechowujemy hash (SHA-256) zamiast pełnego tekstu, aby nie obciążać bazy dużymi tekstami i umożliwić wykrywanie duplikatów.
- **Brak tabeli użytkowników:** Używamy wbudowanej tabeli `auth.users` z Supabase Auth. Nie tworzymy osobnej tabeli profilów (poza zakresem MVP).
