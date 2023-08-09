import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NEVER, Observable, map } from 'rxjs';
import { RecipeMetadata } from '../../../../interfaces';
import { DataService } from '../data.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="text-center d-flex w-100 h-100">
      <div class="background-div"></div>
      <div class="container p-6 p-3">
        <img class="mt-4 mb-5 mw-100 px-3" src="assets/logo_white.png" />
        <div>
          <p class="lead">Enter a link or search for a recipe!</p>
          <p class="lead">
            <input type="text" #searchField (keyup)="onInputKeyUp($event)" class="w-100" />
          </p>
          <p class="lead">
            <button (click)="submitUrl()" class="btn btn-lg btn-secondary border-white bg-white text-black">Let's Cook!</button>
          </p>
        </div>

        <hr class="mt-5">

        <div class="mt-5 pb-5" *ngIf="recentRecipesObs | async; let recentRecipes">
          <div *ngIf="recentRecipes.length > 0">
            <h3>Recent Recipes</h3>
            <div class="list-group">
              <a  *ngFor="let recipe of recentRecipes" [routerLink]="['/recipe', recipe.id]"
                class="list-group-item list-group-item-action bg-transparent text-white">
                {{recipe.site}} - {{recipe.name}}
              </a>
              <a [routerLink]="['/jar']" class="list-group-item list-group-item-action bg-transparent text-white">
                View more
              </a>
            </div>
          </div>
          <div *ngIf="recentRecipes.length == 0">
            <button [routerLink]="['/jar']" class="btn btn-lg btn-secondary border-white bg-white text-black">Explore recipes!</button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [
    '.container { z-index: 1; }'
  ]
})
export class HomeComponent {

  @ViewChild('searchField') searchField!: ElementRef<HTMLInputElement>;

  public recentRecipesObs: Observable<(RecipeMetadata & {id: string })[]> = NEVER;

  constructor(
    public readonly dataService: DataService,
    private readonly router: Router
  ) {
    this.recentRecipesObs = this.dataService.getRecentRecipes().pipe(
      map(values => Object.assign(values.map(v => ({ ...v, id: dataService.resolveUrl(v.url)?.id }))))
    );
  }

  onInputKeyUp(event: KeyboardEvent) {
    if (event.code === 'Enter') {
      this.submitUrl();
    }
  }

  submitUrl() {
    const urlOrSearch = this.searchField.nativeElement.value;
    if (urlOrSearch.startsWith('http')) {
      this.router.navigate(['/load'], { queryParams: { url: urlOrSearch }, skipLocationChange: true });
    } else {
      this.router.navigate(['/jar'], { queryParams: { q: urlOrSearch } });
    }
  }
}
