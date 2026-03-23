import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResumeService } from '../../services/resume.service';

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

  constructor(private resumeService: ResumeService) {}

  // This matches your HTML
  onResumeSelect(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  analyze() {

    if (!this.selectedFile || !this.jobDescription.trim()) {
      alert("Please upload a resume and enter job description.");
      return;
    }

    this.isLoading = true;

    this.resumeService.analyzeResume(this.selectedFile, this.jobDescription).subscribe({
      next: (response) => {

        const cleanResponse = { ...response };

        this.analysisCompleted.emit(cleanResponse);

        this.isLoading = false;
      },
      error: (error) => {
        console.error("API Error:", error);
        this.isLoading = false;
      }
    });
  }
}
