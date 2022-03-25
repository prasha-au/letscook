import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-home',
  template: `

    <div class="text-center d-flex w-100 h-100 p-3 mx-auto flex-column ">
      <div class="p-6">
        <h1>Welcome!</h1>
        <p class="lead">Enter a URL and lets get started!.</p>
        <p class="lead">
          <input type="text" class="w-100" />
        </p>

      </div>
    </div>
  `,
  styles: [
  ]
})
export class HomeComponent implements OnInit {


  constructor(
    public readonly userService: UserService,
    private readonly router: Router
  ) {

  }

  ngOnInit(): void {

  }

}
