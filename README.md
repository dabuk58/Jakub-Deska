# Plan implementacji (Angular 20)

## Założenia techniczne

- Angular 20, **standalone components**
- **Zoneless** (`provideZonelessChangeDetection()`)
- **TailwindCSS v4**
- Lazy loading feature’ów
- HTTP: `HttpClient` (adapter `withFetch`)
- Stan: **signals** (+ `computed`, `effect`)
- Cache w singletonie (w pamięci) – brak ponownych fetchy bez potrzeby
- Responsywność (desktop/mobile), prosty loader/skeleton
- Co najmniej 1 animacja `@animate.enter` / `@animate.leave`

---

## 1) Struktura katalogów

```text
src/
├─ app/
│ ├─ app.config.ts
│ ├─ app.routes.ts
│ ├─ core/
│ │ ├─ models/
│ │ │ ├─ post.model.ts
│ │ │ ├─ user.model.ts
│ │ │ └─ comment.model.ts
│ │ ├─ components/
│ │ │ ├─ header.component.ts
│ │ │ └─ footer.component.ts
│ │ └─ services/
│ │ ├─ posts-api.service.ts
│ │ └─ posts-store.service.ts
│ ├─ shared/
│ │ ├─ ui/
│ │ │ ├─ spinner.component.ts
│ │ │ └─ favorite-toggle.component.ts
│ │ └─ pipes/
│ │ └─└─ truncate.pipe.ts
│ ├─ features/
│ │ ├─ posts/
│ │ │ ├─ posts.routes.ts
│ │ │ ├─ posts.page.ts
│ │ │ └─ components/
│ │ │ ├─ posts-filters.component.ts
│ │ │ └─ posts-list.component.ts
│ │ ├─ post/
│ │ │ ├─ post.routes.ts
│ └─└─└─ post.page.ts
├─ styles.css
└─ main.ts
```

## 2) Lista komponentów

### Shared/UI

- **`SpinnerComponent`** – prosty loader
- **`FavoriteToggleComponent`** – serduszko/toggle; `@Output() toggled`.

### Feature: `posts`

- **`PostsPage` (container)**
  - Łączy filtry ze storem, wyświetla loader/błędy/empty state i `PostsList`.
- **`PostsFiltersComponent`**
  - Pola: `q` (tekst, filtr po treści), `userId` (select → fetch `/posts?userId=`), `onlyFav` (checkbox).
  - Emity do `PostsPage`, który aktualizuje store.
- **`PostsListComponent`**
  - Lista kart; tytuł + fragment treści; przycisk "Szczegóły"; toggle ulubionych.

### Feature: `post`

- **`PostPage` (szczegóły)**
  - Pobiera: pełny post (z cache/store), autora (`/users/:id`), komentarze (`/posts/:id/comments`).
  - Animacja wejścia/wyjścia (`@animate.enter` / `@animate.leave`).

---

## 3) Serwisy

### `PostsApiService` (HTTP)

- **`getPosts(params?: { userId?: number }) : Observable<Post[]>`**
  - `GET https://jsonplaceholder.typicode.com/posts`
  - lub `GET .../posts?userId=ID` (gdy filtr po użytkowniku).
- **`getUser(userId: number) : Observable<User>`**
  - `GET .../users/:id`
- **`getComments(postId: number) : Observable<Comment[]>`**
  - `GET .../posts/:id/comments`

> Odpowiedzialność: tylko transport danych, żadnej logiki filtracji/cachowania.

### `PostsStoreService` (singleton, signals + cache)

**Signals (stan surowy):**

- `posts = signal<Post[]>([])`
- `favorites = signal<Set<number>>(new Set())`
- `loading = signal<boolean>(false)`
- `error = signal<string | null>(null)`
- `filters = signal<{ q: string; userId: number | null; onlyFav: boolean }>({ q:'', userId:null, onlyFav:false })`
- `lastUserIdFetched = signal<number | null>(null)` // do kontroli cache

**Computed (stan pochodny):**

- `filteredPosts = computed(() => ...)`
  - Filtr po treści (`q`) **na froncie** (title+body).
  - Filtr **tylko ulubione** (sprawdza `favorites`).
  - (Uwaga: filtr po `userId` nie jest tu stosowany — on steruje refetchem danych.)

**Efekty:**

- `effect(() => { const uid = filters().userId; loadPostsForUser(uid ?? undefined); })`
  - Na zmianę `userId` store wykona fetch `/posts?userId=...`.

**API store’u:**

- `loadPostsForUser(userId?: number)` – pobiera dane **tylko jeśli**:
  - `lastUserIdFetched !== (userId ?? null)` **lub** `posts()` jest puste.
  - Ustawia `loading/error`, aktualizuje `posts` i `lastUserIdFetched`.
- `setQuery(q: string)` – aktualizuje `filters.q` (bez fetchu).
- `setUserId(userId: number | null)` – aktualizuje `filters.userId` (→ wywoła fetch).
- `toggleOnlyFav()` – lokalny filtr (bez fetchu).
- `toggleFavorite(postId: number)` – dodaj/usuń z `favorites`.

**Cache – zasada:**

- Dane postów przechowujemy w pamięci w `posts`.
- Nowy fetch wykonujemy **wyłącznie** gdy:
  - zmienia się filtr `userId` (backendowy), lub
  - nastąpi odświeżenie strony (utrata pamięci).
- Filtr tekstowy i “tylko ulubione” działają czysto frontowo (bez zapytań).

---

## 4) Podejście do zarządzania stanem

- **Źródło prawdy**: `PostsStoreService` (singleton w `core/services`) z **signals**.
- **Dane z backendu**: ładowane via `PostsApiService`, cachowane w store – brak duplikacji fetchy.
- **Stan pochodny (UI)**: obliczany w `computed` (filtry po treści, tylko ulubione).
- **Reaktywność**: `effect` nasłuchuje `filters.userId` i wykonuje fetch tylko przy jego zmianie.
- **Interakcje**:
  - Komponenty **nie filtrują** lokalnie poza emitami do store.
  - `PostsPage` → steruje filtrami poprzez API store (np. `setQuery`, `setUserId`, `toggleOnlyFav`).
  - `FavoriteToggleComponent` → wywołuje `toggleFavorite(id)`.
