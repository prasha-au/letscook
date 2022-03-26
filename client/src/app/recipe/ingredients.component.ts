import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IngredientGroup } from '../../../../interfaces';


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
            (change)="onChecked($event.target)"
            [defaultChecked]="checkedItems.indexOf('ingredient-'+groupIdx+'-'+i) != -1"
          >
          <label class="form-check-label" [for]="'ingredient-'+groupIdx+'-'+i">
            {{ingredient.amount}} {{ingredient.unit}}
            {{ingredient.name}}
            <span *ngIf="ingredient.notes" class="text-white-50">{{ingredient.notes}}</span>
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


  @Input() checkedItems!: string[];
  @Output() checkedItemsChange = new EventEmitter<string[]>();


  constructor() {}

  ngOnInit(): void {}


  onChecked(input: EventTarget | null) {
    if (!input) {
      return;
    }
    const id = (<HTMLInputElement>input).id;
    const checked = (<HTMLInputElement>input).checked;

    if (checked) {
      this.checkedItems = [...this.checkedItems, id];
    } else {
      this.checkedItems = this.checkedItems.filter(v => v !== id);
    }
    this.checkedItemsChange.emit(this.checkedItems);
  }

}
