import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './components/upload/upload.component';
import { ResultComponent } from './components/result/result.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, UploadComponent, ResultComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  analysisResult: any = null;

  constructor(private cdr: ChangeDetectorRef) {}

  handleAnalysis(result: any) {

    // CRITICAL FIX: force new reference
    this.analysisResult = null;

    setTimeout(() => {
      this.analysisResult = { ...result };
      this.cdr.detectChanges();
    }, 0);
  }

  ngAfterViewInit(): void {
    this.initNeuralBackground();
  }

  initNeuralBackground() {
    const canvas = document.getElementById('neuralCanvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const dots: any[] = [];
    for (let i = 0; i < 80; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach(dot => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#2563eb';
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }
}