import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PostsStore } from '../../../../core/services/posts-store';

@Component({
  selector: 'app-posts-list',
  imports: [MatCardModule, MatIconModule, RouterLink, MatButtonModule],
  templateUrl: './posts-list.html',
  styleUrl: './posts-list.css',
})
export class PostsList {
  readonly store = inject(PostsStore);

  isFav(id: number): boolean {
    return this.store.favorites().has(id);
  }

  toggleFav(id: number): void {
    this.store.toggleFavorite(id);
  }
}
