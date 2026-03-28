import { Component, AfterViewInit, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadComponent } from './components/upload/upload.component';
import { ResultComponent } from './components/result/result.component';
import { AuthService, AuthUser } from './services/auth.service';
import { ResumeService } from './services/resume.service';
import { finalize, timeout } from 'rxjs/operators';

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
  selectedPlan: 'free' | 'pro-monthly' | 'pro-yearly' = 'free';
  authMode: 'signin' | 'signup' = 'signin';
  signUpFullName = '';
  signInEmail = '';
  signInPassword = '';
  resetPassword = '';
  resetPasswordConfirm = '';
  signInMessage = '';
  signInError = '';
  authLoading = false;
  forgotPasswordMode = false;
  currentUser: AuthUser | null = null;
  history: any[] = [];
  private authWatchdogTimer: ReturnType<typeof setTimeout> | null = null;
  readonly passwordRequirements = [
    { key: 'length', label: 'At least 10 characters' },
    { key: 'lowercase', label: 'At least one lowercase letter' },
    { key: 'uppercase', label: 'At least one uppercase letter' },
    { key: 'number', label: 'At least one number' },
    { key: 'special', label: 'At least one special character' }
  ];
  readonly coverLetterFormatBlocks = [
    {
      title: '1. Professional Header',
      description: 'Include your name, email, phone, date, hiring manager details, and company address.'
    },
    {
      title: '2. Role-Aligned Opening',
      description: 'Clearly mention the job title and a concise reason why you are a strong candidate.'
    },
    {
      title: '3. Value & Impact Paragraphs',
      description: 'Present 2-3 quantified achievements that match the role requirements and business outcomes.'
    },
    {
      title: '4. Contextual Closing',
      description: 'Reinforce fit, thank the hiring team, and request a conversation with a professional sign-off.'
    }
  ];
  readonly coverLetterSamples = [
    {
      title: 'Software Engineer Demo',
      shortLabel: 'Software Engineer PDF',
      fileName: 'Cover-Letter-Software-Engineer-Demo.pdf',
      summary: 'Backend + frontend impact-focused letter for product engineering roles.',
      lines: [
        'ALEX SHARMA',
        'Bangalore, India | alex.sharma@email.com | +91 98765 22331 | linkedin.com/in/alex-sharma',
        'Date: March 29, 2026',
        '',
        'Hiring Manager',
        'NovaStack Technologies',
        '',
        'Subject: Application for Software Engineer',
        '',
        'Dear Hiring Manager,',
        'I am excited to apply for the Software Engineer role at NovaStack Technologies.',
        'With 5+ years of experience in Angular, Spring Boot, and cloud-native systems, I build reliable',
        'products that improve both user experience and engineering velocity.',
        '',
        'In my current role, I reduced API latency by 42% by redesigning service interactions and query paths.',
        'I also led a modular frontend refactor that improved release stability and raised Lighthouse scores',
        'from 64 to 92 across core customer-facing pages.',
        '',
        'I am particularly interested in NovaStack because of your focus on scalable hiring technology.',
        'I would value the opportunity to contribute to high-impact product initiatives and discuss my fit.',
        '',
        'Thank you for your consideration.',
        'Sincerely,',
        'Alex Sharma'
      ]
    },
    {
      title: 'Data Analyst Demo',
      shortLabel: 'Data Analyst PDF',
      fileName: 'Cover-Letter-Data-Analyst-Demo.pdf',
      summary: 'Business analytics letter with SQL, BI, and measurable dashboard outcomes.',
      lines: [
        'MEERA REDDY',
        'Hyderabad, India | meera.reddy@email.com | +91 90000 55661',
        'Date: March 29, 2026',
        '',
        'Hiring Team',
        'InsightBridge Analytics',
        '',
        'Subject: Application for Data Analyst',
        '',
        'Dear Hiring Team,',
        'I am writing to express my interest in the Data Analyst position at InsightBridge Analytics.',
        'I specialize in SQL, Tableau, and business KPI modeling to convert raw data into decisions.',
        '',
        'At my current organization, I built executive dashboards that reduced weekly reporting effort',
        'by 11 hours and improved forecast accuracy by 18%. I also automated validation checks that',
        'decreased data-quality incidents by 35% quarter-over-quarter.',
        '',
        'I am confident my analytical rigor and business communication skills align with your team goals.',
        'I would welcome the chance to discuss how I can support your data strategy roadmap.',
        '',
        'Thank you for your time.',
        'Best regards,',
        'Meera Reddy'
      ]
    },
    {
      title: 'Marketing Specialist Demo',
      shortLabel: 'Marketing Specialist PDF',
      fileName: 'Cover-Letter-Marketing-Specialist-Demo.pdf',
      summary: 'Performance marketing sample with campaign, SEO, and conversion metrics.',
      lines: [
        'RINA THOMAS',
        'Chennai, India | rina.thomas@email.com | +91 98888 11881',
        'Date: March 29, 2026',
        '',
        'Hiring Manager',
        'BluePeak Digital',
        '',
        'Subject: Application for Marketing Specialist',
        '',
        'Dear Hiring Manager,',
        'I am pleased to apply for the Marketing Specialist role at BluePeak Digital.',
        'My background includes full-funnel campaign execution, SEO optimization, and performance reporting.',
        '',
        'In my recent role, I improved paid campaign conversion rates by 27% and reduced cost per lead',
        'by 22% through audience segmentation, creative iteration, and landing page testing.',
        'I also increased organic traffic by 41% in 6 months via SEO content strategy.',
        '',
        'I am excited by BluePeak\'s growth strategy and would be glad to contribute to measurable pipeline impact.',
        'I look forward to discussing this opportunity.',
        '',
        'Sincerely,',
        'Rina Thomas'
      ]
    },
    {
      title: 'HR Generalist Demo',
      shortLabel: 'HR Generalist PDF',
      fileName: 'Cover-Letter-HR-Generalist-Demo.pdf',
      summary: 'People-ops and recruitment operations template with onboarding and retention wins.',
      lines: [
        'KARTHIK IYER',
        'Pune, India | karthik.iyer@email.com | +91 97777 44112',
        'Date: March 29, 2026',
        '',
        'Talent Acquisition Team',
        'PeopleFirst Solutions',
        '',
        'Subject: Application for HR Generalist',
        '',
        'Dear Talent Acquisition Team,',
        'I am applying for the HR Generalist role at PeopleFirst Solutions with strong experience in',
        'recruitment coordination, employee engagement, HR operations, and policy compliance.',
        '',
        'I streamlined onboarding workflows that reduced joining cycle time by 30% and partnered with',
        'business leaders to improve first-year retention by 14%. I also standardized interview scorecards',
        'to improve hiring consistency across 5 business units.',
        '',
        'I am eager to contribute to a people-centered culture and operationally strong HR function.',
        'Thank you for considering my application.',
        '',
        'Regards,',
        'Karthik Iyer'
      ]
    }
  ];
  readonly realTimeWorkflowSteps = [
    {
      title: '1. Resume Ingestion & Parsing',
      excerpt: 'Uploaded resume content is extracted and normalized into analyzable text blocks for ATS-style processing.'
    },
    {
      title: '2. Skill & Keyword Extraction',
      excerpt: 'The engine identifies IT, non-IT, and soft skills from both resume and job description using unified matching.'
    },
    {
      title: '3. Gap Detection & Risk Flags',
      excerpt: 'Critical missing skills are prioritized from JD weighting rules and presented as actionable risk indicators.'
    },
    {
      title: '4. Multi-Factor ATS Scoring',
      excerpt: 'Scores are computed across skill alignment, keyword relevance, experience fit, impact evidence, and formatting.'
    },
    {
      title: '5. Explainable Insights',
      excerpt: 'Users receive strengths, weaknesses, and improvement suggestions with practical ordering for faster edits.'
    },
    {
      title: '6. Persistent Analysis History',
      excerpt: 'Authenticated users can revisit previous analysis runs and track improvements over time.'
    }
  ];
  readonly analysisVisualCards = [
    {
      header: 'Parser Output',
      metric: 'Skills Found: 42',
      title: 'Resume Parsing Snapshot',
      description: 'Section-aware extraction captures experience, skills, education, and measurable outcomes.'
    },
    {
      header: 'Match Engine',
      metric: 'Coverage: 78%',
      title: 'Skill Alignment Snapshot',
      description: 'Role-weighted comparison highlights matched and missing skills with priority on required terms.'
    },
    {
      header: 'ATS Score',
      metric: 'Overall: 81/100',
      title: 'Scoring Snapshot',
      description: 'Composite scoring blends relevance, impact quality, and ATS formatting readiness.'
    }
  ];
  readonly platformPrinciples = [
    {
      title: 'Deterministic Scoring',
      description: 'Consistent scoring logic improves trust and makes progress measurable after each resume revision.'
    },
    {
      title: 'Actionable Guidance',
      description: 'Suggestions are specific and prioritized, helping users act quickly instead of guessing what to edit.'
    },
    {
      title: 'Domain-Aware Matching',
      description: 'The skills engine covers technical, non-technical, and soft skills for broad role compatibility.'
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
    if (this.authWatchdogTimer) {
      clearTimeout(this.authWatchdogTimer);
      this.authWatchdogTimer = null;
    }
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

    if (this.forgotPasswordMode) {
      this.submitForgotPassword();
      return;
    }

    if (this.authMode === 'signup' && !this.signUpFullName.trim()) {
      this.signInError = 'Please enter your full name.';
      return;
    }

    if (!this.signInEmail.trim() || !this.signInPassword.trim()) {
      this.signInError = 'Please enter both email and password.';
      return;
    }

    if (this.authMode === 'signup') {
      const unmet = this.getUnmetPasswordRequirements(this.signInPassword);
      if (unmet.length) {
        this.signInError = `Password does not meet requirements: ${unmet.join(', ')}.`;
        return;
      }
    }

    this.startAuthRequestWatchdog();

    if (this.authMode === 'signup') {
      this.authService
        .signUp(this.signUpFullName, this.signInEmail, this.signInPassword)
        .pipe(
          timeout(15000),
          finalize(() => {
            this.authLoading = false;
            if (this.authWatchdogTimer) {
              clearTimeout(this.authWatchdogTimer);
              this.authWatchdogTimer = null;
            }
          })
        )
        .subscribe({
        next: (response) => {
          this.authService.storeSession(response);
          this.currentUser = {
            userId: response.userId,
            fullName: response.fullName,
            email: response.email
          };
          this.signInMessage = `Welcome, ${response.fullName}! Account created successfully.`;
          this.signInError = '';
          this.signInPassword = '';
          this.loadHistory();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.signInError = this.resolveAuthError(err, 'Unable to create account.');
          this.cdr.detectChanges();
        }
      });
      return;
    }

    this.authService
      .signIn(this.signInEmail, this.signInPassword)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.authLoading = false;
          if (this.authWatchdogTimer) {
            clearTimeout(this.authWatchdogTimer);
            this.authWatchdogTimer = null;
          }
        })
      )
      .subscribe({
      next: (response) => {
        this.authService.storeSession(response);
        this.currentUser = {
          userId: response.userId,
          fullName: response.fullName,
          email: response.email
        };
        this.signInMessage = `Welcome back, ${response.fullName}! Signed in successfully.`;
        this.signInError = '';
        this.signInPassword = '';
        this.loadHistory();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.signInError = this.resolveAuthError(err, 'Unable to sign in.');
        this.cdr.detectChanges();
      }
    });
  }

  switchAuthMode(mode: 'signin' | 'signup') {
    this.authMode = mode;
    this.forgotPasswordMode = false;
    this.signInMessage = '';
    this.signInError = '';
    this.signInPassword = '';
    this.resetPassword = '';
    this.resetPasswordConfirm = '';
  }

  toggleForgotPasswordMode() {
    this.forgotPasswordMode = !this.forgotPasswordMode;
    this.signInMessage = '';
    this.signInError = '';
    this.signInPassword = '';
    this.resetPassword = '';
    this.resetPasswordConfirm = '';
  }

  submitForgotPassword() {
    this.signInMessage = '';
    this.signInError = '';

    if (!this.signInEmail.trim()) {
      this.signInError = 'Please enter your email address.';
      return;
    }

    if (!this.resetPassword.trim() || !this.resetPasswordConfirm.trim()) {
      this.signInError = 'Please enter and confirm your new password.';
      return;
    }

    if (this.resetPassword !== this.resetPasswordConfirm) {
      this.signInError = 'New password and confirmation do not match.';
      return;
    }

    const unmet = this.getUnmetPasswordRequirements(this.resetPassword);
    if (unmet.length) {
      this.signInError = `Password does not meet requirements: ${unmet.join(', ')}.`;
      return;
    }

    this.startAuthRequestWatchdog();

    this.authService
      .forgotPassword(this.signInEmail, this.resetPassword)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.authLoading = false;
          if (this.authWatchdogTimer) {
            clearTimeout(this.authWatchdogTimer);
            this.authWatchdogTimer = null;
          }
        })
      )
      .subscribe({
      next: (response) => {
        this.signInMessage = response?.message || 'Password reset successful. Please sign in with your new password.';
        this.signInError = '';
        this.forgotPasswordMode = false;
        this.signInPassword = '';
        this.resetPassword = '';
        this.resetPasswordConfirm = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.signInError = this.resolveAuthError(err, 'Unable to reset password.');
        this.cdr.detectChanges();
      }
    });
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
    this.forgotPasswordMode = false;
    this.signInPassword = '';
    this.resetPassword = '';
    this.resetPasswordConfirm = '';
    this.signInMessage = showMessage ? 'Signed out successfully.' : '';
    this.signInError = '';
    this.cdr.detectChanges();
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

  getPasswordRequirementState(requirementKey: string): boolean {
    const password = this.forgotPasswordMode ? (this.resetPassword || '') : (this.signInPassword || '');
    switch (requirementKey) {
      case 'length':
        return password.length >= 10;
      case 'lowercase':
        return /[a-z]/.test(password);
      case 'uppercase':
        return /[A-Z]/.test(password);
      case 'number':
        return /\d/.test(password);
      case 'special':
        return /[^A-Za-z0-9]/.test(password);
      default:
        return false;
    }
  }

  private getUnmetPasswordRequirements(password: string): string[] {
    return this.passwordRequirements
      .filter((item) => !this.getPasswordRequirementStateForValue(item.key, password))
      .map((item) => item.label);
  }

  private getPasswordRequirementStateForValue(requirementKey: string, password: string): boolean {
    switch (requirementKey) {
      case 'length':
        return password.length >= 10;
      case 'lowercase':
        return /[a-z]/.test(password);
      case 'uppercase':
        return /[A-Z]/.test(password);
      case 'number':
        return /\d/.test(password);
      case 'special':
        return /[^A-Za-z0-9]/.test(password);
      default:
        return false;
    }
  }

  private resolveAuthError(err: any, fallback: string): string {
    if (err?.name === 'TimeoutError') {
      return 'Request timed out. Please check backend deployment and try again.';
    }
    if (err?.status === 0) {
      return 'Server is unreachable. Please wait a moment and retry.';
    }
    return err?.error?.error || fallback;
  }

  getUserInitials(): string {
    const fullName = this.currentUser?.fullName?.trim();
    if (!fullName) return '';

    const parts = fullName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].substring(0, 1).toUpperCase();
    }

    const first = parts[0].substring(0, 1).toUpperCase();
    const last = parts[parts.length - 1].substring(0, 1).toUpperCase();
    return `${first}${last}`;
  }

  private startAuthRequestWatchdog() {
    this.authLoading = true;
    if (this.authWatchdogTimer) {
      clearTimeout(this.authWatchdogTimer);
    }
    this.authWatchdogTimer = setTimeout(() => {
      if (this.authLoading) {
        this.authLoading = false;
        this.signInError = 'Authentication request is taking too long. Please retry.';
        this.cdr.detectChanges();
      }
    }, 20000);
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

  downloadCoverLetterSample(fileName: string, lines: string[]) {
    const pdfBlob = this.buildSimplePdf(lines);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  choosePlan(plan: 'free' | 'pro-monthly' | 'pro-yearly') {
    this.selectedPlan = plan;
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
