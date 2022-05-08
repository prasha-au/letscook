import { Component } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  template: `
  <div class="h-100 w-100 text-white bg-dark">
    <router-outlet></router-outlet>
  </div>
  `,
  styles: []
})
export class AppComponent {
  constructor(public readonly userService: UserService) {}
}
