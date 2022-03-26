import { trigger, transition } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { right, left } from '../animations';
import { Recipe } from '../../../../interfaces'

@Component({
  selector: 'app-recipe-view',
  template: `

  <div class="d-flex h-100 flex-column">


    <div *ngIf="recipe.image" class="background" [style.backgroundImage]="'url('+recipe?.image+')'"></div>

    <main class="h-100 d-flex flex-column main">

      <div class="w-100 mt-4 mb-3">
        <a [routerLink]="['/']" type="button" class="btn btn-sm btn-outline-light float-start position-absolute ms-3">Back</a>
        <h2 class="text-center">{{recipe.name}}</h2>
      </div>


      <div class="text-center mb-3">
        <span (click)="setTab('ingredients')" class="mx-3 tab-text" [class.inactive]="visibleTab != 'ingredients'">Ingredients</span>
        <span (click)="setTab('instructions')" class="mx-3 tab-text" [class.inactive]="visibleTab != 'instructions'">Instructions</span>
        <span (click)="setTab('notes')" class="mx-3 tab-text" [class.inactive]="visibleTab != 'notes'">Notes</span>
      </div>

      <div class="h-100 overflow-auto" (touchstart)="swipe($event, 'start')" (touchend)="swipe($event, 'end')"  [@animTabs]="animationState">
        <app-recipe-ingredients *ngIf="visibleTab == 'ingredients'" [ingredientGroups]="recipe?.ingredients"></app-recipe-ingredients>

        <app-recipe-instructions *ngIf="visibleTab == 'instructions'" [instructionGroups]="recipe?.instructions"></app-recipe-instructions>

        <app-recipe-notes *ngIf="visibleTab == 'notes'" [notes]="recipe?.notes"></app-recipe-notes>
      </div>
    </main>
  </div>

  `,
  styles: [
    '.background { z-index: 0; position: fixed; width: 100vw; height: 100vh; filter: blur(8px); background-size: cover; }',
    '.background:after { content: ""; position: fixed; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); }',
    '.main { z-index: 1; }',
    '.tab-text.inactive { opacity: 0.5; }'
  ],
  animations: [
    trigger('animTabs', [
      transition(':increment', right),
      transition(':decrement', left),
    ]),
  ],
})
export class RecipeViewComponent implements OnInit {

  @Input() recipe!: Recipe;

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


  setTab(tab: 'ingredients' | 'instructions' | 'notes') {
    const currentIndex = this.availableTabs.indexOf(this.visibleTab);
    const newIndex = this.availableTabs.indexOf(tab);

    this.visibleTab = tab;
    this.animationState += newIndex > currentIndex ? 1 : -1;
  }

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
