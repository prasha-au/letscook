import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { map, Observable, of, timer } from 'rxjs';


export interface TimerRequest {
  duration: number;
  label: string;
}

@Component({
  selector: 'app-timer',
  template: `
    <ng-container *ngIf="{ value: timeLeft$ | async } as timeLeft">
      <div *ngIf="timeLeft.value !== null && timeLeft.value >= 0" class="position-fixed bottom-0 end-0 p-2">
        <div (click)="cancel.emit(undefined)" class="badge bg-primary fs-1 p-3">
          {{formatDisplay(timeLeft.value)}}
        </div>
      </div>

      <div *ngIf="timeLeft.value !== null && timeLeft.value < 0" class="timer-expired-container position-fixed top-50 start-50 translate-middle">
        <div class="timer-expired rounded shadow bg-danger p-5 fw-bold text-center" (click)="cancel.emit(undefined)">
          {{request?.label ?? ''}}<br />
          timer expired!
        </div>
      </div>
    </ng-container>

  `,
  styles: [
    `.timer-expired-container { z-index: 10; }`,
    `.timer-expired { font-size: 30px; }`
  ]
})
export class TimerComponent implements OnChanges {

  @Input() request?: TimerRequest;

  @Output() cancel = new EventEmitter<void>();

  public timeLeft$: Observable<number | null> = of(null);

  ngOnChanges(): void {
    this.timeLeft$ = !this.request ? of(null) : timer(0, 1000).pipe(map((idx) => this.request!.duration - (idx * 1000)));
  }

  formatDisplay(timeLeft: number): string {
    const secondsLeft = Math.round(timeLeft / 1000);
    const minutesLeft = Math.floor(secondsLeft / 60);
    return [minutesLeft, secondsLeft % 60].map(v => v.toString().padStart(2, '0')).join(':');
  }

}
