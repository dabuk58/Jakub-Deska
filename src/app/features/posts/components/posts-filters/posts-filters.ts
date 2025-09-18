import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PostsStore } from '../../../../core/services/posts-store';

@Component({
  selector: 'app-posts-filters',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './posts-filters.html',
  styleUrl: './posts-filters.css',
})
export class PostsFilters {
  readonly store = inject(PostsStore);
  readonly userIds = Array.from({ length: 10 }, (_, i) => i + 1);

  onQuery(q: string): void {
    this.store.setQuery(q);
  }

  onUserId(value: number | '' | null): void {
    const parsed = value === '' || value === null ? null : Number(value);
    this.store.setUserId(parsed);
  }

  reset(): void {
    this.store.setQuery('');
    this.store.setUserId(null);
    if (this.store.filters().onlyFav) this.store.toggleOnlyFav();
  }
}
