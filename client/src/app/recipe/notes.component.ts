import { Component, Input, OnInit } from '@angular/core';


@Component({
  selector: 'app-recipe-notes',
  template: `

  <div class="container">
    <div>
      <ul>
        <li *ngFor="let note of notes">{{note}}</li>
      </ul>
    </div>
  </div>

  `,
  styles: [
  ]
})
export class NotesComponent implements OnInit {

  @Input() notes?: string[];

  constructor() { }

  ngOnInit(): void {
  }

}
