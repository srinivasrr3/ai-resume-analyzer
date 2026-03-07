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
  jobDescription: string = '';
  isLoading: boolean = false;

  constructor(private http: HttpClient) {}

  // File selection
  onResumeSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  analyze() {

    if (!this.selectedFile || !this.jobDescription.trim()) {
      alert("Please upload a resume and paste the job description.");
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('jobDescription', this.jobDescription);

    this.isLoading = true;

    this.http.post<any>(
      "https://ai-resume-analyzer-pypx.onrender.com/api/resume/upload",
      formData
    ).subscribe({
      next: (response) => {

        // Create new object reference so Angular detects changes
        const cleanResponse = { ...response };

        this.analysisCompleted.emit(cleanResponse);

        this.isLoading = false;
      },
      error: (err) => {
        console.error("Analysis failed:", err);
        alert("Resume analysis failed. Please try again.");
        this.isLoading = false;
      }
    });
  }
}