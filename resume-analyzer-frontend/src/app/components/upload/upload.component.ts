import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {

  @Output() analysisCompleted = new EventEmitter<any>();

  selectedFile: File | null = null;
  jobDescription = '';
  isLoading = false;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  analyze() {

    if (!this.selectedFile || !this.jobDescription.trim()) {
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('jobDescription', this.jobDescription);

    this.isLoading = true;

    this.http.post<any>('http://localhost:8080/api/resume/upload', formData)
      .subscribe({
        next: (response) => {

          // CRITICAL FIX: create new reference
          const cleanResponse = { ...response };

          this.analysisCompleted.emit(cleanResponse);

          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }
}