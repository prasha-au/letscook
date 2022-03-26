import { Injectable } from '@angular/core';
import { Database, object, objectVal, ref } from '@angular/fire/database';
import { Functions, httpsCallableData } from '@angular/fire/functions';
import { firstValueFrom, map, Observable } from 'rxjs';
import { ParseRequest, Recipe, ResolvedUrl } from '../../../interfaces';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private readonly database: Database,
    private functions: Functions
  ) { }


  public getRecipe(id: string): Observable<Recipe> {
    return objectVal(ref(this.database, `recipes/${id}`));
  }


  public getRecipeParseStatus(id: string): Observable<ParseRequest | null> {
    return object(ref(this.database, `parse_requests/${id}`)).pipe(
      map(v => v.snapshot.val()),
    );
  }


  private readonly requestParseCallable = httpsCallableData(this.functions, 'supersuper');
  public async requestParse(url: string): Promise<void> {
    await firstValueFrom(this.requestParseCallable({ url }));
    return;
  }


  public resolveUrl(query: string): ResolvedUrl | null {
    let url: URL;

    try {
      url = new URL(query);
    } catch (e) {
      return null;
    }

    return {
      id: url.hostname.replace(/^www\./, '').replace(/\./g, '_') + url.pathname.replace(/\/$/, '').replace(/\//g, '_'),
      url: `${url.origin}${url.pathname}`,
    };
  }


}
