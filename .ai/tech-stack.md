# 10xCards - Stos Technologiczny

## 1. Frontend

### Next.js 15 (App Router)
- **Wersja:** 15.x z App Router
- **Uzasadnienie:** App Router oferuje server components, streaming, oraz wbudowane API routes (Route Handlers). Zapewnia lepsze SEO, szybsze ładowanie stron i uproszczoną architekturę full-stack.
- **Kluczowe funkcje:** Server Components, Server Actions, Middleware, Route Handlers

### React 19
- **Wersja:** 19.x
- **Uzasadnienie:** Najnowsza stabilna wersja React z ulepszonym renderowaniem, Actions API oraz lepszą integracją z server components.

### TypeScript
- **Uzasadnienie:** Statyczne typowanie zmniejsza liczbę błędów runtime, ułatwia refactoring i poprawia developer experience dzięki autouzupełnianiu w IDE. Wymagane przez kurs 10x.

## 2. Stylowanie

### Tailwind CSS 4
- **Wersja:** 4.x
- **Uzasadnienie:** Utility-first CSS framework pozwala na szybkie budowanie interfejsu bez pisania osobnych plików CSS. Wersja 4 przynosi nowy silnik (Oxide), mniejsze pliki wyjściowe i lepszą wydajność.

### Shadcn/ui
- **Uzasadnienie:** Biblioteka gotowych, dostępnych (accessible) komponentów UI zbudowanych na Radix UI i Tailwind CSS. Komponenty kopiowane do projektu (nie instalowane jako zależność), co daje pełną kontrolę nad kodem. Spójna estetyka i zgodność z WCAG.
- **Kluczowe komponenty:** Button, Card, Dialog, Form, Input, Textarea, Toast

## 3. Backend

### Next.js API Routes (Route Handlers)
- **Uzasadnienie:** Pełna integracja z frontendem w jednym projekcie. Route Handlers w App Router obsługują wszystkie metody HTTP i oferują edge runtime. Eliminuje potrzebę osobnego serwera backendowego dla MVP.
- **Struktura:** `src/app/api/` z plikami `route.ts`

## 4. Baza danych

### Supabase (PostgreSQL)
- **Uzasadnienie:** Zarządzana instancja PostgreSQL z wbudowanym REST API, autentykacją i Row Level Security. Darmowy tier wystarczający dla MVP. Supabase JS SDK upraszcza integrację z frontendem i backendem.
- **Kluczowe funkcje:**
  - **PostgreSQL** - pełna relacyjna baza danych
  - **Row Level Security (RLS)** - każdy użytkownik widzi tylko swoje dane, polityki bezpieczeństwa na poziomie bazy
  - **Migracje** - zarządzanie schematem przez SQL migration files
  - **Realtime** - (opcjonalnie) subskrypcje zmian w bazie

## 5. Autentykacja

### Supabase Auth
- **Metoda:** Email + hasło
- **Uzasadnienie:** Natywna integracja z bazą Supabase. Zarządzanie sesjami, tokenami JWT i odświeżaniem sesji. Gotowe komponenty auth (opcjonalnie). RLS policies opierają się na `auth.uid()`.
- **Przepływ:**
  1. Rejestracja - tworzenie konta w Supabase Auth
  2. Logowanie - otrzymanie sesji JWT
  3. Middleware Next.js - weryfikacja sesji i ochrona stron
  4. API Routes - weryfikacja tokenu i przekazanie `user_id` do zapytań bazodanowych

## 6. AI / LLM

### OpenRouter.ai
- **Model:** `google/gemini-2.0-flash-001`
- **Uzasadnienie:** OpenRouter zapewnia dostęp do wielu modeli LLM przez jedno API. Gemini 2.0 Flash oferuje szybkie odpowiedzi przy niskim koszcie, co jest kluczowe dla interaktywnego generowania fiszek. Możliwość łatwej zmiany modelu w przyszłości.
- **Integracja:**
  - Wywołanie z Route Handler (server-side) - klucz API nie jest eksponowany na frontendzie
  - Structured output (JSON) z walidacją odpowiedzi
  - Obsługa błędów i retry logic
  - Logowanie czasu generowania i błędów

## 7. Testowanie

### Playwright
- **Typ:** Testy End-to-End (E2E)
- **Uzasadnienie:** Playwright oferuje niezawodne testy cross-browser, auto-waiting, oraz łatwe testowanie scenariuszy użytkownika. Wymagany przez kurs 10x.
- **Zakres testów:**
  - Rejestracja i logowanie
  - Generowanie fiszek z tekstu
  - CRUD fiszek
  - Walidacja formularzy

## 8. CI/CD

### GitHub Actions
- **Uzasadnienie:** Natywna integracja z repozytorium GitHub. Darmowe minuty w darmowym planie. Automatyzacja testów i deploymentu.
- **Pipeline:**
  1. **Lint** - ESLint sprawdza jakość kodu
  2. **Type check** - TypeScript sprawdza typowanie
  3. **Build** - Kompilacja projektu Next.js
  4. **E2E Tests** - Uruchomienie testów Playwright
  5. **Deploy** - (opcjonalnie) Automatyczny deployment na Vercel

## 9. Hosting

### Vercel (rekomendowany)
- **Uzasadnienie:** Natywne wsparcie dla Next.js (twórcy frameworka). Automatyczny deployment z GitHub, podgląd PR (preview deployments), edge functions, analityka. Darmowy tier wystarczający dla MVP.
- **Alternatywy:** Dowolny host obsługujący Node.js (np. Railway, Fly.io, DigitalOcean App Platform)

## 10. Podsumowanie stosu

| Warstwa | Technologia | Wersja |
|---------|-------------|--------|
| Framework | Next.js (App Router) | 15.x |
| UI Library | React | 19.x |
| Język | TypeScript | 5.x |
| Stylowanie | Tailwind CSS | 4.x |
| Komponenty UI | Shadcn/ui | latest |
| Baza danych | Supabase (PostgreSQL) | - |
| Autentykacja | Supabase Auth | - |
| AI/LLM | OpenRouter.ai (Gemini 2.0 Flash) | - |
| Testy E2E | Playwright | latest |
| CI/CD | GitHub Actions | - |
| Hosting | Vercel | - |
