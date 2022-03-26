import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DataService } from '../data.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="text-center d-flex w-100 h-100 p-3 mx-auto flex-column">
      <div class="container mt-5 p-6">
        <h1 class="mb-5">Let's Cook!</h1>
        <div>
          <p class="lead">Enter a link and get started!.</p>
          <p class="lead">
            <input type="text" (input)="changeUrl($event)" class="w-100" />
          </p>
          <p class="lead">
            <button (click)="submitUrl()" class="btn btn-lg btn-secondary border-white bg-white text-black">Let's Cook!</button>
          </p>
        </div>

        <div>


        </div>
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
    public readonly dataService: DataService,
    private readonly router: Router
  ) {

  }

  async ngOnInit(): Promise<void> {
    await firstValueFrom(this.dataService.getRandomRecipes());
  }

  changeUrl(event: Event) {
    this.url = (<HTMLInputElement>event?.target).value;
  }

  submitUrl() {
    this.router.navigate(['/load'], { queryParams: { url: this.url } });
  }



}
