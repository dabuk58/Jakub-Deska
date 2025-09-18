import { Component, inject } from '@angular/core';
import { PostsStore } from '../../../core/services/posts-store';
import { Spinner } from '../../../shared/ui/spinner/spinner';
import { PostsFilters } from '../components/posts-filters/posts-filters';
import { PostsList } from '../components/posts-list/posts-list';

@Component({
  selector: 'app-posts.page',
  imports: [PostsFilters, PostsList, Spinner],
  templateUrl: './posts.page.html',
  styleUrl: './posts.page.css',
})
export class PostsPage {
  readonly store = inject(PostsStore);
}
