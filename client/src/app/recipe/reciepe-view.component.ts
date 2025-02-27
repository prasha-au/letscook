import { Location } from '@angular/common'
import { trigger, transition } from '@angular/animations';
import { Component, Input } from '@angular/core';
import { right, left } from '../animations';
import { Recipe } from '../../../../interfaces';
import type { TimerRequest } from './timer.component';

const AVAILABLE_TABS = ['ingredients', 'instructions', 'video',  'notes', 'split'] as const;
type TabType = (typeof AVAILABLE_TABS)[number];

@Component({
  selector: 'app-recipe-view',
  template: `

  <div class="d-flex h-100 flex-column">

    <div *ngIf="recipe.image" class="background-div" [style.backgroundImage]="'url('+recipe.image+')'"></div>

    <main class="h-100 d-flex flex-column main">

      <div class="w-100 mt-4 mb-3 px-3 d-flex">
        <div>
          <button (click)="location.back()" type="button" class="btn btn-sm btn-outline-light">Back</button>
        </div>
        <h2 class="text-center flex-fill">
          {{recipe.name}}
          <a [href]="recipe.url" rel="noreferrer noopener" target="_blank" class="text-secondary text-decoration-none">&#9432;</a>
        </h2>
        <div>
          <app-timer [request]="timerRequest" (cancel)="timerRequest = undefined"></app-timer>
        </div>
      </div>

      <div class="text-center mb-4 section-links">
        <span (click)="setTab('ingredients')" class="mx-3 tab-text" [class.inactive]="visibleTab != 'ingredients'">Ingredients</span>
        <span (click)="setTab('instructions')" class="mx-3 tab-text" [class.inactive]="visibleTab != 'instructions'">Instructions</span>
        <span *ngIf="recipe.video" (click)="setTab('video')" class="mx-3 tab-text" [class.inactive]="visibleTab != 'video'">Video</span>
        <span *ngIf="recipe.notes?.length" (click)="setTab('notes')" class="mx-3 tab-text" [class.inactive]="visibleTab != 'notes'">Notes</span>
        <span (click)="setTab('split')" class="mx-3 tab-text" [class.inactive]="visibleTab != 'split'">Split</span>
      </div>

      <div class="h-100 overflow-auto" (touchstart)="swipe($event, 'start')" (touchend)="swipe($event, 'end')"  [@animTabs]="animationState">
        <app-recipe-ingredients [hidden]="visibleTab != 'ingredients'" [ingredientGroups]="recipe.ingredients" [(checkedItems)]="checkedItems" [(scale)]="scale"></app-recipe-ingredients>

        <app-recipe-instructions [hidden]="visibleTab != 'instructions'" [instructionGroups]="recipe.instructions" (addTimer)="timerRequest = $event"></app-recipe-instructions>

        <app-recipe-video [hidden]="visibleTab != 'video'" [video]="recipe.video"></app-recipe-video>

        <app-recipe-notes [hidden]="visibleTab != 'notes'" [notes]="recipe.notes"></app-recipe-notes>

        <div [hidden]="visibleTab != 'split'" class="container-fluid pt-3 h-100">
          <div class="row h-100">
            <app-recipe-ingredients class="col-lg-5 split-col overflow-auto pb-3" [ingredientGroups]="recipe.ingredients" [(checkedItems)]="checkedItems" [(scale)]="scale"></app-recipe-ingredients>
            <div class="container d-lg-none px-4 mb-4"><hr></div>
            <app-recipe-instructions class="col-lg split-col overflow-auto pb-3" [instructionGroups]="recipe.instructions" (addTimer)="timerRequest = $event"></app-recipe-instructions>
          </div>
        </div>

      </div>
    </main>
  </div>

  `,
  styles: [
    '.background-div {  filter: blur(6px); }',
    '.background-div:after { background: rgba(0,0,0,0.7); }',
    '.main { z-index: 1; }',
    '.tab-text { cursor: pointer; }',
    '.tab-text.inactive { opacity: 0.5; }',
    '@media screen and ( min-width: 992px ) { .split-col { height: 100% !important; } } ',
  ],
  animations: [
    trigger('animTabs', [
      transition(':increment', right),
      transition(':decrement', left),
    ]),
  ],
})
export class RecipeViewComponent {

  @Input() recipe!: Recipe;

  public animationState: number = 1;

  public visibleTab: TabType = 'split';

  public checkedItems: string[] = [];

  public scale: number = 1;

  public showOptions: boolean = false;

  public timerRequest?: TimerRequest = undefined;

  private swipeCoord?: [number, number];
  private swipeTime?: number;

  constructor(
    public location: Location,
  ) {}

  setTab(tab: TabType) {
    const currentIndex = AVAILABLE_TABS.indexOf(this.visibleTab);
    const newIndex = AVAILABLE_TABS.indexOf(tab);

    this.visibleTab = tab;
    this.animationState += newIndex > currentIndex ? 1 : -1;
  }

  moveTabs(direction: 'next' | 'previous') {
    const currentIndex = AVAILABLE_TABS.indexOf(this.visibleTab);
    const newIndex = (currentIndex + (direction === 'next' ? 1 : -1)) % AVAILABLE_TABS.length;
    this.visibleTab = AVAILABLE_TABS[newIndex < 0 ? AVAILABLE_TABS.length - 1 : newIndex];
    this.animationState += direction === 'next' ? 1 : -1;
  }

  swipe(e: Event | TouchEvent, when: string): void {
    if (!('changedTouches' in e) || (e.target as HTMLElement)?.nodeName === 'INPUT') {
      return;
    }
    const coord: [number, number] = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
    const time = new Date().getTime();

    if (when === 'start') {
      this.swipeCoord = coord;
      this.swipeTime = time;
    } else if (when === 'end' && this.swipeCoord != undefined) {
      const direction = [coord[0] - this.swipeCoord[0], coord[1] - this.swipeCoord[1]];
      const duration = time - (this.swipeTime ?? 0);

      if (duration < 1000  && Math.abs(direction[0]) > 30 && Math.abs(direction[0]) > Math.abs(direction[1] * 3)) {
        this.moveTabs(direction[0] < 0 ? 'next' : 'previous');
      }
    }
  }


}
