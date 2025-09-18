import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: `/posts`,
    pathMatch: 'full',
  },
  {
    path: 'posts',
    loadComponent: () => import('./features/posts/posts.page/posts.page').then((c) => c.PostsPage),
  },
  {
    path: 'post/:id',
    loadComponent: () => import('./features/post/post.page/post.page').then((c) => c.PostPage),
  },
  {
    path: '**',
    redirectTo: '/posts',
  },
];
