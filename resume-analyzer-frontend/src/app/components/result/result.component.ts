import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnChanges {

  @Input() result: any;

  overallScore = 0;
  keywordScore = 0;
  skillScore = 0;
  formatScore = 0;
  contentScore = 0;

  displayedSuggestions = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {

    if (!changes['result'] || !this.result) return;

    this.resetValues();

    setTimeout(() => {
      this.animateValue('overallScore', this.result.matchScore);
      this.animateValue('keywordScore', this.result.keywordScore);
      this.animateValue('skillScore', this.result.skillScore);
      this.animateValue('formatScore', this.result.formatScore);
      this.animateValue('contentScore', this.result.contentScore);

      this.typeSuggestions();
    }, 100);
  }

  private resetValues() {
    this.overallScore = 0;
    this.keywordScore = 0;
    this.skillScore = 0;
    this.formatScore = 0;
    this.contentScore = 0;
    this.displayedSuggestions = '';
  }

  private animateValue(field: string, target: number) {

    let current = 0;

    const interval = setInterval(() => {

      if (current >= target) {
        clearInterval(interval);
        return;
      }

      current++;
      (this as any)[field] = current;
      this.cdr.detectChanges();

    }, 15);
  }

  private typeSuggestions() {

    if (!this.result.improvementSuggestions) return;

    const text = this.result.improvementSuggestions.join('\n• ');
    let index = 0;

    const typing = setInterval(() => {

      if (index >= text.length) {
        clearInterval(typing);
        return;
      }

      this.displayedSuggestions += text.charAt(index);
      index++;
      this.cdr.detectChanges();

    }, 15);
  }
}