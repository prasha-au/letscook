import { Component, OnInit } from '@angular/core';
import { DATA } from '../../fakedata';
import { Recipe } from '../../../../interfaces';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { map, NEVER, Observable, startWith } from 'rxjs';


@Component({
  selector: 'app-recipe',
  template: `


  <div class="h-100" *ngIf="recipeObs| async; let recipe;">
    <div  class="h-100" [ngSwitch]="recipe">


      <div *ngSwitchCase="recipe == 'loading'">
        Loading...
      </div>
      <div *ngSwitchCase="recipe == 'notfound'">
        Recipe not found!
      </div>
      <app-recipe-view *ngSwitchDefault [recipe]="$any(recipe)"></app-recipe-view>

    </div>

  </div>


  `,
  styles: [],
})
export class RecipeComponent implements OnInit {

  public recipe?: Recipe = DATA;
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
      startWith('loading' as const),
    )
  }

// http://localhost:4200/recipe/dinnerthendessert_com_mongolian-beef


}
