import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IngredientGroup } from '../../../../interfaces';
import { formatIngredientQuantity } from './helpers';

@Component({
  selector: 'app-recipe-ingredients',
  template: `

  <div class="container">
    <div *ngFor="let group of ingredientGroups; let groupIdx = index;" class="mb-4">
      <h5 *ngIf="group.name">{{group.name}}</h5>
      <div *ngFor="let ingredient of group.ingredients; let i = index">
        <div class="form-check">
          <input class="form-check-input"
            type="checkbox"
            value=""
            [id]="'ingredient-'+groupIdx+'-'+i"
            (change)="onChecked($event.target!)"
            [defaultChecked]="checkedItems.indexOf('ingredient-'+groupIdx+'-'+i) != -1"
          >
          <label class="form-check-label" [for]="'ingredient-'+groupIdx+'-'+i">
            {{formatIngredientQuantity(ingredient.amount * scale, ingredient.unit)}}
            {{ingredient.name}}
            <span *ngIf="ingredient.notes" class="text-white-50">{{ingredient.notes}}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-10">
        <input type="range" class="form-range" min="0" max="6" step="1" value="2" (change)="onScale($event.target!)">
      </div>
      <div class="col-2">{{scale}}x</div>
    </div>

  </div>

  `,
  styles: [
  ]
})
export class IngredientsComponent {

  @Input() ingredientGroups?: IngredientGroup[];

  @Input() checkedItems!: string[];
  @Output() checkedItemsChange = new EventEmitter<string[]>();

  public scale: number = 1;

  onChecked(input: EventTarget) {
    const id = (<HTMLInputElement>input).id;
    const checked = (<HTMLInputElement>input).checked;

    if (checked) {
      this.checkedItems = [...this.checkedItems, id];
    } else {
      this.checkedItems = this.checkedItems.filter(v => v !== id);
    }
    this.checkedItemsChange.emit(this.checkedItems);
  }

  public formatIngredientQuantity = formatIngredientQuantity;

  onScale(input: EventTarget) {
    const SCALE_VALUES = [0.25, 0.5, 1, 1.5, 2, 3, 4];
    const scaleIndex = parseInt((<HTMLInputElement>input).value, 10);
    this.scale = SCALE_VALUES[scaleIndex % SCALE_VALUES.length];
  }
}
