import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Post } from '../models/post';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class PostsApi {
  private http = inject(HttpClient);

  getPosts(params?: { userId?: number | null }): Observable<Post[]> {
    let httpParams = new HttpParams();
    if (params?.userId != null) {
      httpParams = httpParams.set('userId', String(params.userId));
    }
    return this.http.get<Post[]>(`${environment.apiUrl}/posts`, { params: httpParams });
  }

  getUser(userId: number): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${userId}`);
  }

  getComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${environment.apiUrl}/posts/${postId}/comments`);
  }
}
