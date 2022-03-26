import { Injectable } from '@angular/core';
import { Database, limitToLast, object, objectVal, orderByKey, query, ref, set } from '@angular/fire/database';
import { map, Observable } from 'rxjs';
import { ParseRequest, Recipe, ResolvedUrl, TableName } from '../../../interfaces';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private readonly database: Database
  ) { }


  public getRecipe(id: string): Observable<Recipe> {
    return objectVal(ref(this.database, `${TableName.RECIPE}/${id}`));
  }


  public getRecipeParseStatus(id: string): Observable<ParseRequest | null> {
    return object(ref(this.database, `${TableName.PARSE_REQUEST}/${id}`)).pipe(
      map(v => v.snapshot.val()),
    );
  }


  public async requestParse(resolvedUrl: ResolvedUrl): Promise<void> {
    await set(ref(this.database, `${TableName.PARSE_REQUEST}/${resolvedUrl.id}`), { url: resolvedUrl.url });
  }


  public getRandomRecipes(): Observable<{ id: string; name: string; url: string }[]> {
    return objectVal<Record<string, string[]>>(query(ref(this.database, TableName.RECIPE_METADATA), orderByKey(), limitToLast(10))).pipe(
      map(data => {
        console.log('data', data);
        return [];
      })
    );
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
