import { Component, OnInit } from '@angular/core';
import { Recipe } from '../../../../interfaces';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { first, map, NEVER, Observable, startWith, tap } from 'rxjs';


@Component({
  selector: 'app-recipe',
  template: `

  <div class="h-100" *ngIf="recipeObs| async; let recipe;">
    <div  class="h-100" [ngSwitch]="recipe">

      <div *ngSwitchCase="'loading'" class="d-flex h-100 w-100 flex-column justify-content-center align-items-center">
        <div class="spinner-border text-light" role="status" style="width: 10rem; height: 10rem;"></div>
        <p class="lead text-center mt-3">Loading</p>
      </div>

      <div *ngSwitchCase="'notfound'" class="d-flex h-100 w-100 flex-column justify-content-center align-items-center">
        <h2>Not Found!</h2>
        <p class="lead">The recipe you are looking for was not found.</p>
        <p class="lead">
          <a href="#" class="btn btn-secondary border-white bg-white text-black">Back Home</a>
        </p>
      </div>

      <app-recipe-view *ngSwitchDefault [recipe]="$any(recipe)"></app-recipe-view>

    </div>

  </div>

  `,
  styles: [],
})
export class RecipeComponent implements OnInit {
  public recipeObs: Observable<Recipe | 'loading' | 'notfound'> = NEVER;


  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) { }


  ngOnInit(): void {
    const recipeId = this.route.snapshot.paramMap.get('id');
    if (!recipeId) {
      return;
    }
    this.recipeObs = this.dataService.getRecipe(recipeId).pipe(
      map(v => v === null ? 'notfound' : v),
      first(),
      tap(() => {
        this.dataService.addToRecentRecipes(recipeId);
      }),
      startWith('loading' as const),
    );
  }

}
