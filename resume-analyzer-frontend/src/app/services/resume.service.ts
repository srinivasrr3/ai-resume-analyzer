import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {

  private apiUrl = 'http://localhost:8080/api/resume/upload';

  constructor(private http: HttpClient) {}

  analyzeResume(file: File, jobDescription: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobDescription', jobDescription);

    return this.http.post<any>(this.apiUrl, formData);
  }
}
