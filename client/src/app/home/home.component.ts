import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NEVER, Observable } from 'rxjs';
import { RecipeMetadata } from '../../../../interfaces';
import { DataService } from '../data.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="text-center d-flex w-100 h-100 p-3 mx-auto flex-column">
      <div class="container p-6">
        <img class="mt-2 mb-5" src="assets/logo_white.png" />
        <div>
          <p class="lead">Enter a link and get started!</p>
          <p class="lead">
            <input type="text" (input)="changeUrl($event)" class="w-100" />
          </p>
          <p class="lead">
            <button (click)="submitUrl()" class="btn btn-lg btn-secondary border-white bg-white text-black">Let's Cook!</button>
          </p>
        </div>

        <hr class="mt-5">

        <div class="mt-5" *ngIf="randomRecipesObs | async; let randomRecipes">
          <h3>Recent Recipes</h3>
          <div class="list-group">
            <a  *ngFor="let recipe of randomRecipes | keyvalue" [routerLink]="['/recipe', recipe.key]"
              class="list-group-item list-group-item-action bg-transparent text-white">
              {{recipe.value.site}} - {{recipe.value.name}}
            </a>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class HomeComponent implements OnInit {

  public url: string = '';

  public randomRecipesObs: Observable<Record<string, RecipeMetadata>> = NEVER;

  constructor(
    public readonly userService: UserService,
    public readonly dataService: DataService,
    private readonly router: Router
  ) {
    this.randomRecipesObs = this.dataService.getRandomRecipes();
  }

  async ngOnInit(): Promise<void> {
  }

  changeUrl(event: Event) {
    this.url = (<HTMLInputElement>event?.target).value;
  }

  submitUrl() {
    this.router.navigate(['/load'], { queryParams: { url: this.url } });
  }



}
