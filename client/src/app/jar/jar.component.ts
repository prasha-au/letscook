import { Location } from '@angular/common'
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged, firstValueFrom, fromEvent, map, NEVER, Observable, tap } from 'rxjs';
import { RecipeMetadata } from '../../../../interfaces';
import { DataService } from '../data.service';

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
        <input class="w-100 ph-3 text-center" type="text" placeholder="Search..." #searchField />
      </div>

      <div class="list-group h-100 overflow-auto">
        <a *ngFor="let recipe of filteredRecipes" [routerLink]="['/recipe', recipe.id]"
          class="list-group-item list-group-item-action bg-transparent text-white">
          {{recipe.site}} - {{recipe.name}}
        </a>
      </div>

    </div>
  `,
  styles: [
    '.container { z-index: 1; }'
  ]
})
export class JarComponent implements OnInit, AfterViewInit {


  @ViewChild('searchField') searchField!: ElementRef;

  private allRecipes: RecipeItem[] = []
  public filteredRecipes: RecipeItem[] = [];

  constructor(
    private readonly dataService: DataService,
    public location: Location
  ) { }

  async ngOnInit(): Promise<void> {
    const recipeResponse = await firstValueFrom(this.dataService.getRecipes());
    this.allRecipes = Object.entries(recipeResponse).map(([id, item]) => {
      return { id, ...item, searchValue: `${item.site} ${item.name}`.toLocaleLowerCase() };
    });
    this.filteredRecipes = this.allRecipes;
  }


  ngAfterViewInit() {
    fromEvent(this.searchField.nativeElement,'keyup').pipe(
      debounceTime(150),
      distinctUntilChanged(),
      map(() => this.searchField.nativeElement.value),
    )
    .subscribe(searchTermRaw => {
      if (!searchTermRaw) {
        this.filteredRecipes = this.allRecipes;
      } else {
        const searchTerm = searchTermRaw.toLocaleLowerCase();
        this.filteredRecipes = this.allRecipes.filter(v => v.searchValue.includes(searchTerm));
      }
    });
  }


}
