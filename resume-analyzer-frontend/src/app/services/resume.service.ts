import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  // Use same-origin API path. In dev this can be proxied, and in Vercel it is rewritten to Render.
  private readonly apiUrl = '/api/resume/upload';
  private readonly historyUrl = '/api/resume/history';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  analyzeResume(file: File, jobDescription: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobDescription', jobDescription);

    return this.http.post<any>(this.apiUrl, formData, { headers: this.authService.authHeaders() });
  }

  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(this.historyUrl, { headers: this.authService.authHeaders() });
  }
}
