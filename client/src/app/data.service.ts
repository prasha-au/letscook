import { Injectable } from '@angular/core';
import { Database, objectVal, ref } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { Recipe } from '../../../interfaces';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private readonly database: Database) { }


  public getRecipe(id: string): Observable<Recipe> {
    return objectVal(ref(this.database, `recipes/${id}`));
  }


}
