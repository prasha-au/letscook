import { Component, Input, OnInit } from '@angular/core';
import { IngredientGroup } from '../../../../interfaces';


@Component({
  selector: 'app-recipe-ingredients',
  template: `

  <div class="container">
    <div *ngFor="let group of ingredientGroups; let groupIdx = index;" class="mb-4">
      <h5 *ngIf="group.name">{{group.name}}</h5>
      <div *ngFor="let ingredient of group.ingredients; let i = index">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" [id]="'ingredient-'+groupIdx+'-'+i">
          <label class="form-check-label" [for]="'ingredient-'+groupIdx+'-'+i">
            {{ingredient.amount}} {{ingredient.unit}}
            {{ingredient.name}}
          </label>
        </div>
      </div>
    </div>

  </div>

  `,
  styles: [
  ]
})
export class IngredientsComponent implements OnInit {

  @Input() ingredientGroups?: IngredientGroup[];

  constructor() { }

  ngOnInit(): void {
  }

}
