import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="text-center d-flex w-100 h-100 p-3 mx-auto flex-column">
      <div class="mt-5 p-6">
        <h1>Welcome!!</h1>
        <p class="lead">Enter a URL and lets get started!.</p>
        <p class="lead">
          <input type="text" (input)="changeUrl($event)" class="w-100" />
        </p>
        <p class="lead">
          <button (click)="submitUrl()" class="btn btn-lg btn-secondary fw-bold border-white bg-white text-black">Let's Cook!</button>
        </p>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class HomeComponent implements OnInit {

  public url: string = '';

  constructor(
    public readonly userService: UserService,
    private readonly router: Router
  ) {

  }

  ngOnInit(): void {

  }

  changeUrl(event: Event) {
    this.url = (<HTMLInputElement>event?.target).value;
  }

  submitUrl() {
    this.router.navigate(['/load'], { queryParams: { url: this.url } });
  }



}
