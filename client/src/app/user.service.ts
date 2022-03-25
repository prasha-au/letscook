import { Injectable, Optional } from '@angular/core';
import { Auth, authState, FacebookAuthProvider, signInWithPopup, signOut, User } from '@angular/fire/auth';
import { Database, objectVal, ref } from '@angular/fire/database';
import { EMPTY, firstValueFrom, Observable, shareReplay, switchMap } from 'rxjs';
import * as _ from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly authUser: Observable<User | null> = EMPTY;

  public readonly user: Observable<{
    userId: string;
    name: string;
  } | null>;


  constructor(
    @Optional() private auth: Auth,
    private database: Database
  ) {
    this.authUser = authState(this.auth);

    this.user = this.authUser.pipe(
      switchMap(async user => {
        if (user == null) {
          return null;
        }
        return { userId: user.uid, name: user.displayName ?? user.uid };
      }),
      shareReplay(1),
    )
  }


  public async login() {
    return await signInWithPopup(this.auth, new FacebookAuthProvider());
  }

  public async logout() {
    return await signOut(this.auth);
  }

}
