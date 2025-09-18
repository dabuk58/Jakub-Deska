import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Post } from '../models/post';
import { PostsApi } from './posts-api';

type Filters = {
  q: string;
  userId: number | null;
  onlyFav: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class PostsStore {
  private api = inject(PostsApi);

  readonly posts = signal<Post[]>([]);
  readonly favorites = signal<Set<number>>(new Set());
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly filters = signal<Filters>({ q: '', userId: null, onlyFav: false });

  //null = all users
  private readonly cache = new Map<number | null, Post[]>();

  readonly filteredPosts = computed(() => {
    const query = this.filters().q.toLowerCase().trim();
    const favs = this.favorites();

    return this.posts().filter((p) => {
      const matchesTerm = query ? (p.title + ' ' + p.body).toLowerCase().includes(query) : true;
      const matchesFav = this.filters().onlyFav ? favs.has(p.id) : true;
      return matchesTerm && matchesFav;
    });
  });

  private readonly _fetchOnUserChange = effect(async () => {
    const uid = this.filters().userId;
    await this.loadPostsForUser(uid ?? null);
  });

  setQuery(q: string) {
    this.filters.update((f) => ({ ...f, q }));
  }

  setUserId(userId: number | null) {
    this.filters.update((f) => ({ ...f, userId }));
  }

  toggleOnlyFav() {
    this.filters.update((f) => ({ ...f, onlyFav: !f.onlyFav }));
  }

  toggleFavorite(postId: number) {
    this.favorites.update((curr) => {
      const next = new Set(curr);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  }

  async loadPostsForUser(userId: number | null, force = false): Promise<void> {
    if (!force && this.cache.has(userId)) {
      this.posts.set(this.cache.get(userId)!);
      this.error.set(null);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.api.getPosts({ userId: userId ?? undefined }));
      this.cache.set(userId, data);
      this.posts.set(data);
    } catch (e) {
      console.error(e);
      this.error.set('Nie udało się pobrać postów. Spróbuj ponownie.');
    } finally {
      this.loading.set(false);
    }
  }

  getPostFromStore(postId: number): Post | undefined {
    return this.posts().find((p) => p.id === postId);
  }
}
