# 10xCards - Dokument Wymagań Produktowych (PRD)

## 1. Nazwa projektu

**10xCards** - Generator fiszek oparty na sztucznej inteligencji

## 2. Opis projektu

10xCards to aplikacja webowa umożliwiająca szybkie tworzenie fiszek edukacyjnych przy pomocy AI. Użytkownik wkleja fragment tekstu, a system automatycznie generuje propozycje fiszek (pytanie-odpowiedź), które można zaakceptować, edytować lub odrzucić. Aplikacja pozwala również na ręczne tworzenie i zarządzanie fiszkami.

## 3. Problem

Ręczne tworzenie fiszek edukacyjnych jest czasochłonne i wymaga znacznego wysiłku. Proces ten obejmuje:
- Czytanie materiału źródłowego i identyfikowanie kluczowych pojęć
- Formułowanie pytań i odpowiedzi
- Ręczne wprowadzanie każdej fiszki do systemu

Ten żmudny proces zniechęca wielu użytkowników do korzystania z metody fiszek, mimo jej udowodnionej skuteczności w nauce.

## 4. Rozwiązanie

AI analizuje wklejony tekst i automatycznie generuje propozycje fiszek. Użytkownik:
1. Wkleja tekst źródłowy (1000-10000 znaków)
2. Otrzymuje zestaw propozycji fiszek wygenerowanych przez AI
3. Przegląda każdą propozycję i decyduje: zaakceptować bez zmian, edytować i zaakceptować, lub odrzucić
4. Zaakceptowane fiszki trafiają do kolekcji użytkownika

Dzięki temu tworzenie fiszek z dłuższego tekstu zajmuje sekundy zamiast minut.

## 5. User Stories

### US-1: Rejestracja i logowanie
**Jako** użytkownik,
**chcę** zarejestrować się i zalogować do aplikacji,
**aby** mieć dostęp do swoich fiszek z dowolnego urządzenia.

**Kryteria akceptacji:**
- Rejestracja za pomocą adresu email i hasła
- Logowanie za pomocą adresu email i hasła
- Przekierowanie do dashboardu po zalogowaniu
- Komunikat o błędzie przy niepoprawnych danych

### US-2: Generowanie fiszek z tekstu przez AI
**Jako** użytkownik,
**chcę** wkleić tekst (1000-10000 znaków) i wygenerować propozycje fiszek za pomocą AI,
**aby** szybko stworzyć fiszki bez ręcznego przepisywania.

**Kryteria akceptacji:**
- Pole tekstowe z walidacją długości (1000-10000 znaków)
- Licznik znaków z informacją o limicie
- Przycisk "Generuj fiszki" aktywny tylko przy poprawnej długości tekstu
- Wyświetlenie animacji ładowania podczas generowania
- Lista propozycji fiszek po zakończeniu generowania
- Obsługa błędów API z komunikatem dla użytkownika

### US-3: Przegląd i akceptacja propozycji AI
**Jako** użytkownik,
**chcę** zaakceptować, edytować lub odrzucić każdą propozycję fiszki wygenerowaną przez AI,
**aby** mieć kontrolę nad jakością swoich fiszek.

**Kryteria akceptacji:**
- Każda propozycja wyświetla przód (pytanie) i tył (odpowiedź)
- Przycisk "Akceptuj" zapisuje fiszkę bez zmian (source: ai-full)
- Przycisk "Edytuj" otwiera formularz edycji, po zapisaniu fiszka ma source: ai-edited
- Przycisk "Odrzuć" usuwa propozycję z listy
- Możliwość zaakceptowania/odrzucenia wszystkich naraz (bulk actions)

### US-4: Ręczne tworzenie, edycja i usuwanie fiszek
**Jako** użytkownik,
**chcę** ręcznie tworzyć, edytować i usuwać fiszki,
**aby** móc zarządzać swoją kolekcją niezależnie od AI.

**Kryteria akceptacji:**
- Formularz tworzenia fiszki z polami: przód (max 200 znaków) i tył (max 500 znaków)
- Walidacja pól formularza
- Edycja istniejącej fiszki z zachowaniem oryginalnych danych
- Usuwanie fiszki z potwierdzeniem
- Ręcznie utworzone fiszki mają source: manual

### US-5: Przeglądanie zapisanych fiszek
**Jako** użytkownik,
**chcę** przeglądać wszystkie moje zapisane fiszki,
**aby** mieć dostęp do całej mojej kolekcji.

**Kryteria akceptacji:**
- Lista fiszek z wyświetleniem przodu i tyłu
- Paginacja lub infinite scroll przy dużej liczbie fiszek
- Informacja o źródle fiszki (AI / AI-edytowana / ręczna)
- Możliwość sortowania (np. wg daty utworzenia)

## 6. Metryki sukcesu

| Metryka | Cel |
|---------|-----|
| Czas generowania fiszek z tekstu | < 30 sekund od wklejenia tekstu do otrzymania propozycji |
| Współczynnik akceptacji propozycji AI | > 50% propozycji zaakceptowanych (z lub bez edycji) |
| Retencja użytkowników | Użytkownik wraca i generuje fiszki ponownie w ciągu 7 dni |

## 7. Zakres MVP

### W zakresie (in scope):
- Rejestracja i logowanie (email + hasło)
- Generowanie fiszek AI z wklejonego tekstu
- Przegląd, akceptacja, edycja i odrzucanie propozycji AI
- Ręczne CRUD fiszek
- Przeglądanie kolekcji fiszek
- Responsywny interfejs (mobile-first)

### Poza zakresem (out of scope):
- Powtarzanie z odstępami (spaced repetition)
- Sesje nauki / quizy
- Profile użytkowników / ustawienia konta
- Usuwanie konta
- Import/export fiszek
- Współdzielenie fiszek między użytkownikami
- Integracja z zewnętrznymi platformami do nauki
- Kategorie / tagi / foldery dla fiszek
- Wersja mobilna (natywna aplikacja)

## 8. Lista funkcjonalności MVP

1. **Autentykacja**
   - Rejestracja email + hasło
   - Logowanie / wylogowanie
   - Ochrona stron wymagających autentykacji

2. **Generowanie AI**
   - Formularz wklejania tekstu z walidacją
   - Integracja z OpenRouter.ai (model: google/gemini-2.0-flash-001)
   - Wyświetlanie propozycji fiszek
   - Akceptacja / edycja / odrzucanie propozycji
   - Logowanie błędów generowania

3. **Zarządzanie fiszkami**
   - Tworzenie ręczne
   - Edycja istniejących
   - Usuwanie z potwierdzeniem
   - Lista z paginacją

4. **Infrastruktura**
   - Baza danych PostgreSQL (Supabase) z RLS
   - CI/CD z GitHub Actions
   - Testy E2E z Playwright
