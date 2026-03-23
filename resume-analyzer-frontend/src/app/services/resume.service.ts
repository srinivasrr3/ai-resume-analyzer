import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  // Use same-origin API path. In dev this can be proxied, and in Vercel it is rewritten to Render.
  private readonly apiUrl = '/api/resume/upload';

  constructor(private http: HttpClient) {}

  analyzeResume(file: File, jobDescription: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobDescription', jobDescription);

    return this.http.post<any>(this.apiUrl, formData);
  }
}
