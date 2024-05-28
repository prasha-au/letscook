import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { InstructionGroup, InstructionStep } from '../../../../interfaces';
import type { TimerRequest } from './timer.component';

interface StepArrayItem {
  type: 'text' | 'timer';
  text: string;
  timer?: TimerRequest;
}

@Component({
  selector: 'app-recipe-instructions',
  template: `
  <div class="container">
    <div *ngFor="let group of instructionGroups; let groupIdx = index;">
      <h5 *ngIf="group.name">{{group.name}}</h5>
      <ol>
        <li *ngFor="let step of group.steps">
          <ng-container *ngFor="let val of instructionStepArray(step)" [ngSwitch]="val.type">
            <span *ngSwitchCase="'text'">{{val.text}}</span>
            <span *ngSwitchCase="'timer'" class="link-primary" role="button" (click)="addTimer.emit(val.timer)">{{val.text}}</span>
          </ng-container>
        </li>
      </ol>
    </div>
  </div>
  `,
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstructionsComponent {

  @Input() instructionGroups?: InstructionGroup[];

  @Output() addTimer = new EventEmitter<TimerRequest>();

  instructionStepArray(step: InstructionStep): StepArrayItem[] {
    if (!step.timers) {
      return [{ type: 'text', text: step.text }];
    }

    let text = step.text;
    for (const timer of step.timers) {
      text = text.replace(timer.text, '||||');
    }
    return text.split('||||').reduce<StepArrayItem[]>((acc, curr, idx) => {
      acc.push({ type: 'text', text: curr });
      const timer = step.timers[idx];
      if (timer) {
        acc.push({
          type: 'timer',
          text: timer.text,
          timer: { duration: timer.duration, label: timer.text }
        });
      }
      return acc;
    }, []);
  }

}
