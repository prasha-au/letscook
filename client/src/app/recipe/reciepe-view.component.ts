import { trigger, transition } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { right, left } from '../animations';
import { Recipe } from '../../../../interfaces'

@Component({
  selector: 'app-recipe-view',
  template: `

  <div class="d-flex h-100 flex-column">
    <main class="h-100 d-flex flex-column">

      <h2 class="text-center mt-4 mb-3">Massaman Curry!</h2>

      <div class="text-center mb-3">
        <!-- <a>prev</a> -->
        <h4 class="d-inline-block">{{tabTitles[visibleTab]}}</h4>
        <!-- <a>next</a> -->
      </div>

      <div class="h-100" (touchstart)="swipe($event, 'start')" (touchend)="swipe($event, 'end')"  [@animTabs]="animationState">
        <app-recipe-ingredients *ngIf="visibleTab == 'ingredients'" [ingredientGroups]="recipe?.ingredients"></app-recipe-ingredients>

        <app-recipe-instructions *ngIf="visibleTab == 'instructions'" [instructionGroups]="recipe?.instructions"></app-recipe-instructions>

        <app-recipe-notes *ngIf="visibleTab == 'notes'" [notes]="recipe?.notes"></app-recipe-notes>
      </div>

    </main>
  </div>


  `,
  styles: [
  ],
  animations: [
    trigger('animTabs', [
      transition(':increment', right),
      transition(':decrement', left),
    ]),
  ],
})
export class RecipeViewComponent implements OnInit {

  @Input() recipe?: Recipe;

  public animationState: number = 1;

  public readonly tabTitles = {
    ingredients: 'Ingredients',
    instructions: 'Instructions',
    notes: 'Notes',
  } as const;
  private readonly availableTabs = ['ingredients', 'instructions', 'notes'] as const;
  public visibleTab: 'ingredients' | 'instructions' | 'notes' = 'ingredients';

  constructor() { }

  ngOnInit(): void {

  }


  private swipeCoord?: [number, number];
  private swipeTime?: number;


  moveTabs(direction: 'next' | 'previous') {
    const currentIndex = this.availableTabs.indexOf(this.visibleTab);
    const newIndex = (currentIndex + (direction === 'next' ? 1 : -1)) % this.availableTabs.length;
    this.visibleTab = this.availableTabs[newIndex < 0 ? this.availableTabs.length - 1 : newIndex];
    this.animationState += direction === 'next' ? 1 : -1;
  }


  swipe(e: Event | TouchEvent, when: string): void {
    if (!('changedTouches' in e)) {
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
