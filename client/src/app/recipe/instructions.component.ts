import { Component, Input, OnInit } from '@angular/core';
import { InstructionGroup } from '../../../../interfaces';



@Component({
  selector: 'app-recipe-instructions',
  template: `

  <div class="container">

    <div *ngFor="let group of instructionGroups; let groupIdx = index;">
      <h5 *ngIf="group.name">{{group.name}}</h5>
        <ol >
          <li *ngFor="let step of group.steps;">{{step}}</li>
        </ol>
    </div>

  </div>

  `,
  styles: [
  ]
})
export class InstructionsComponent implements OnInit {

  @Input() instructionGroups?: InstructionGroup[];


  constructor() { }

  ngOnInit(): void {
  }

}
