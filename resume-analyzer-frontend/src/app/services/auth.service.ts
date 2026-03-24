import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthUser {
  userId: number;
  fullName: string;
  email: string;
}

export interface AuthResponse extends AuthUser {
  token: string;
  expiresAt: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authApi = '/api/auth';
  private readonly tokenKey = 'elevatecv_auth_token';
  private readonly userKey = 'elevatecv_auth_user';

  constructor(private http: HttpClient) {}

  signUp(fullName: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authApi}/signup`, { fullName, email, password });
  }

  signIn(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authApi}/signin`, { email, password });
  }

  signOut(): Observable<any> {
    return this.http.post(`${this.authApi}/signout`, {}, { headers: this.authHeaders() });
  }

  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.authApi}/me`, { headers: this.authHeaders() });
  }

  storeSession(response: AuthResponse) {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(
      this.userKey,
      JSON.stringify({ userId: response.userId, fullName: response.fullName, email: response.email })
    );
  }

  clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): AuthUser | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  authHeaders(): HttpHeaders {
    const token = this.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
