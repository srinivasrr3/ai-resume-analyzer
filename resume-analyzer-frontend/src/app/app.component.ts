import { Component, AfterViewInit, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadComponent } from './components/upload/upload.component';
import { ResultComponent } from './components/result/result.component';
import { AuthService, AuthUser } from './services/auth.service';
import { ResumeService } from './services/resume.service';

type PageName =
  | 'home'
  | 'resume'
  | 'cover-letters'
  | 'blog'
  | 'pricing'
  | 'sign-in'
  | 'contact'
  | 'faqs'
  | 'privacy-policy';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, UploadComponent, ResultComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit, OnDestroy {
  analysisResult: any = null;
  currentPage: PageName = 'home';
  authMode: 'signin' | 'signup' = 'signin';
  signUpFullName = '';
  signInEmail = '';
  signInPassword = '';
  signInMessage = '';
  signInError = '';
  authLoading = false;
  currentUser: AuthUser | null = null;
  history: any[] = [];
  readonly passwordRecommendations = [
    'Use at least 10 characters.',
    'Include uppercase, lowercase, and numbers.',
    'Add at least one special character.'
  ];
  readonly blogPosts = [
    {
      title: '7 ATS Mistakes That Kill Strong Resumes',
      excerpt: 'A practical checklist to avoid parser failures and keyword blind spots before you apply.'
    },
    {
      title: 'How to Tailor Your Resume in 10 Minutes',
      excerpt: 'Use role-specific skill clusters and impact bullets to improve matching without rewriting everything.'
    },
    {
      title: 'Cover Letter Prompts That Actually Work',
      excerpt: 'Structured prompts to generate concise, role-aligned cover letters with measurable impact statements.'
    }
  ];

  private readonly popStateHandler = () => {
    this.currentPage = this.pathToPage(window.location.pathname);
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private resumeService: ResumeService
  ) {}

  ngOnInit(): void {
    this.currentPage = this.pathToPage(window.location.pathname);
    window.addEventListener('popstate', this.popStateHandler);
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.authService.me().subscribe({
        next: (user) => {
          this.currentUser = user;
          this.loadHistory();
        },
        error: () => {
          this.clearAuthState(false);
        }
      });
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('popstate', this.popStateHandler);
  }

  ngAfterViewInit(): void {
    this.initNeuralBackground();
  }

  handleAnalysis(result: any) {
    this.analysisResult = null;
    setTimeout(() => {
      this.analysisResult = { ...result };
      this.cdr.detectChanges();
      if (this.currentUser) {
        this.loadHistory();
      }
    }, 0);
  }

  navigateTo(page: PageName) {
    this.currentPage = page;
    const targetPath = page === 'home' ? '/' : `/${page}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private pathToPage(pathname: string): PageName {
    const clean = pathname.replace(/\/+$/, '') || '/';
    const page = clean.slice(1) as PageName;
    const validPages: PageName[] = [
      'home',
      'resume',
      'cover-letters',
      'blog',
      'pricing',
      'sign-in',
      'contact',
      'faqs',
      'privacy-policy'
    ];
    if (clean === '/') return 'home';
    return validPages.includes(page) ? page : 'home';
  }

  goToAnalyzer() {
    const target = document.getElementById('analyzer-section');
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  submitSignIn() {
    this.signInMessage = '';
    this.signInError = '';

    if (this.authMode === 'signup' && !this.signUpFullName.trim()) {
      this.signInError = 'Please enter your full name.';
      return;
    }

    if (!this.signInEmail.trim() || !this.signInPassword.trim()) {
      this.signInError = 'Please enter both email and password.';
      return;
    }

    this.authLoading = true;

    if (this.authMode === 'signup') {
      this.authService.signUp(this.signUpFullName, this.signInEmail, this.signInPassword).subscribe({
        next: (response) => {
          this.authService.storeSession(response);
          this.currentUser = {
            userId: response.userId,
            fullName: response.fullName,
            email: response.email
          };
          this.signInMessage = response.message || 'Account created successfully.';
          this.signInError = '';
          this.authLoading = false;
          this.loadHistory();
        },
        error: (err) => {
          this.signInError = err?.error?.error || 'Unable to create account.';
          this.authLoading = false;
        }
      });
      return;
    }

    this.authService.signIn(this.signInEmail, this.signInPassword).subscribe({
      next: (response) => {
        this.authService.storeSession(response);
        this.currentUser = {
          userId: response.userId,
          fullName: response.fullName,
          email: response.email
        };
        this.signInMessage = response.message || 'Signed in successfully.';
        this.signInError = '';
        this.authLoading = false;
        this.loadHistory();
      },
      error: (err) => {
        this.signInError = err?.error?.error || 'Unable to sign in.';
        this.authLoading = false;
      }
    });
  }

  switchAuthMode(mode: 'signin' | 'signup') {
    this.authMode = mode;
    this.signInMessage = '';
    this.signInError = '';
  }

  signOut() {
    this.authService.signOut().subscribe({
      next: () => this.clearAuthState(true),
      error: () => this.clearAuthState(true)
    });
  }

  private clearAuthState(showMessage: boolean) {
    this.authService.clearSession();
    this.currentUser = null;
    this.history = [];
    this.signInPassword = '';
    this.signInMessage = showMessage ? 'Signed out successfully.' : '';
    this.signInError = '';
  }

  private loadHistory() {
    if (!this.authService.isAuthenticated()) return;
    this.resumeService.getHistory().subscribe({
      next: (response) => {
        this.history = response || [];
      },
      error: () => {
        this.history = [];
      }
    });
  }

  downloadDemoResume() {
    const lines = [
      'PRIYA SHARMA',
      'Senior Full-Stack Developer | Bangalore, India | priyasharma.dev@email.com | +91 98765 43210',
      '',
      'SUMMARY',
      'Full-stack engineer with 6+ years of experience building high-traffic Angular + Spring Boot products.',
      'Delivered ATS optimization tools improving resume shortlisting rates by 31% across 8 hiring pipelines.',
      '',
      'CORE SKILLS',
      'Angular, TypeScript, Java, Spring Boot, REST APIs, PostgreSQL, Redis, Docker, AWS, CI/CD, TDD',
      '',
      'EXPERIENCE',
      'Senior Software Engineer, TalentBridge AI (2022 - Present)',
      '- Built resume matching engine and reduced response time from 2.8s to 1.1s using caching and indexing.',
      '- Led migration to modular Angular architecture; improved Lighthouse performance score from 62 to 91.',
      '- Designed skills taxonomy and matching logic used in 250K+ profile evaluations.',
      '',
      'Software Engineer, CodeSpring Labs (2019 - 2022)',
      '- Developed recruiter dashboard features used by 3 enterprise clients and 120+ recruiters daily.',
      '- Introduced backend observability with structured logs and alerts, reducing incidents by 44%.',
      '',
      'EDUCATION',
      'B.Tech in Computer Science, VTU (2019)',
      '',
      'PROJECT HIGHLIGHTS',
      'AI Resume Analyzer: Angular + Spring Boot app for ATS scoring, missing-skill detection, and guidance.'
    ];

    const pdfBlob = this.buildSimplePdf(lines);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ElevateCV-Demo-Resume.pdf';
    link.click();
    URL.revokeObjectURL(url);
  }

  private buildSimplePdf(lines: string[]): Blob {
    const escape = (text: string) =>
      text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

    const commands = lines
      .map((line, index) => `1 0 0 1 40 ${800 - index * 22} Tm (${escape(line)}) Tj`)
      .join('\n');

    const contentStream = `BT\n/F1 11 Tf\n${commands}\nET`;

    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`
    ];

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];

    objects.forEach((objectBody, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${objectBody}\nendobj\n`;
    });

    const xrefStart = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';

    for (let i = 1; i < offsets.length; i++) {
      pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    return new Blob([new TextEncoder().encode(pdf)], { type: 'application/pdf' });
  }

  initNeuralBackground() {
    const canvas = document.getElementById('neuralCanvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const dots: Array<{ x: number; y: number; vx: number; vy: number }> = [];
    for (let i = 0; i < 65; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45
      });
    }
    let tick = 0;
    const keywords = ['Angular', 'Java', 'Spring Boot', 'REST', 'SQL', 'Docker'];

    const animate = () => {
      tick += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach((dot, index) => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#2563eb88';
        ctx.fill();

        for (let j = index + 1; j < dots.length; j++) {
          const other = dots[j];
          const dx = dot.x - other.x;
          const dy = dot.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${0.16 - distance / 900})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      const docX = canvas.width * 0.7;
      const docY = canvas.height * 0.18;
      const docW = 220;
      const docH = 280;
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.strokeStyle = 'rgba(37,99,235,0.45)';
      ctx.lineWidth = 1.4;
      ctx.fillRect(docX, docY, docW, docH);
      ctx.strokeRect(docX, docY, docW, docH);

      const scanY = docY + ((Math.sin(tick * 1.8) + 1) / 2) * docH;
      const gradient = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 15);
      gradient.addColorStop(0, 'rgba(59,130,246,0)');
      gradient.addColorStop(0.5, 'rgba(59,130,246,0.4)');
      gradient.addColorStop(1, 'rgba(59,130,246,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(docX, scanY - 15, docW, 30);

      keywords.forEach((keyword, index) => {
        const baseX = canvas.width * 0.15 + index * 80;
        const floatY = canvas.height * 0.72 + Math.sin(tick * 2 + index) * 12;
        ctx.fillStyle = 'rgba(30,64,175,0.14)';
        ctx.fillRect(baseX, floatY, 74, 24);
        ctx.fillStyle = '#1e3a8a';
        ctx.font = '12px Arial';
        ctx.fillText(keyword, baseX + 6, floatY + 16);

        ctx.beginPath();
        ctx.moveTo(baseX + 74, floatY + 12);
        ctx.lineTo(docX, docY + 40 + index * 32);
        ctx.strokeStyle = 'rgba(37,99,235,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      const gaugeX = docX + 40;
      const gaugeY = docY + docH + 55;
      const scoreProgress = (Math.sin(tick) + 1) / 2;
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, 30, Math.PI, Math.PI + Math.PI * scoreProgress);
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.font = 'bold 13px Arial';
      ctx.fillStyle = '#14532d';
      ctx.fillText(`ATS ${Math.round(65 + scoreProgress * 30)}%`, gaugeX - 26, gaugeY + 24);

      requestAnimationFrame(animate);
    };

    animate();
  }
}
