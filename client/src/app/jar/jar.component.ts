import { Location } from '@angular/common'
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RecipeMetadata } from '../../../../interfaces';
import { DataService } from '../data.service';
import debounce from 'lodash/debounce';

interface RecipeItem extends RecipeMetadata {
  id: string;
  searchValue: string;
}

@Component({
  selector: 'app-jar',
  template: `
    <div class=" d-flex w-100 h-100 flex-column">
    <div class="background-div"></div>
      <div class="w-100 mt-4 mb-3">
        <button (click)="location.back()" type="button" class="btn btn-sm btn-outline-light float-start position-absolute ms-3">Back</button>
        <h2 class="text-center">Recipe Jar</h2>
      </div>

      <div class="w-100 mb-3 container">
        <input class="w-100 ph-3 text-center" type="text" placeholder="Search..." [defaultValue]="searchValue" (keyup)="inputChange($event)" />
      </div>

      <div class="list-group h-100 overflow-auto">
        <a *ngFor="let recipe of filteredRecipes" [routerLink]="['/recipe', recipe.id]"
          class="list-group-item list-group-item-action bg-transparent text-white">
          {{recipe.site}} - {{recipe.name}}
        </a>
        <div *ngIf="filteredRecipes.length === 0" class="list-group-item bg-transparent text-white">No matching recipes</div>
      </div>

    </div>
  `,
  styles: [
    '.container { z-index: 1; }'
  ]
})
export class JarComponent implements OnInit {

  public searchValue: string = '';

  private allRecipes: RecipeItem[] = []
  public filteredRecipes: RecipeItem[] = [];

  constructor(
    private readonly dataService: DataService,
    public location: Location,
    private activatedRoute: ActivatedRoute,
  ) { }

  async ngOnInit(): Promise<void> {
    this.searchValue = this.activatedRoute.snapshot.queryParams['q'] ?? '';

    const recipeResponse = await firstValueFrom(this.dataService.getRecipes());
    this.allRecipes = Object.entries(recipeResponse).map(([id, item]) => {
      return { id, ...item, searchValue: `${item.site} ${item.name}`.toLocaleLowerCase() };
    });
    this.filterRecipes();
  }

  inputChange(event: KeyboardEvent) {
    this.searchValue = (<HTMLInputElement>event.target).value;
    if (event.code === 'Enter') {
      this.filterRecipes();
    } else {
      this.filterRecipesDebounced();
    }
  }

  private filterRecipes() {
    if (!this.searchValue) {
      this.filteredRecipes = this.allRecipes;
    } else {
      const filterTerm = this.searchValue.toLocaleLowerCase();
      this.filteredRecipes = this.allRecipes.filter(v => v.searchValue.includes(filterTerm));
    }
  }

  private filterRecipesDebounced = debounce(this.filterRecipes, 150, { trailing: true });

}
