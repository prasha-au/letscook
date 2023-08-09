import { Injectable } from '@angular/core';
import { Database, object, objectVal, orderByKey, query, ref, set } from '@angular/fire/database';
import { combineLatest, map, Observable, of, startWith } from 'rxjs';
import { ParseRequest, RecipeMetadata, Recipe, ResolvedUrl, TableName } from '../../../interfaces';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private readonly database: Database
  ) {}


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


  public getRecipes(): Observable<Record<string, RecipeMetadata>> {
    return objectVal<Record<string, RecipeMetadata>>(query(ref(this.database, TableName.RECIPE_METADATA), orderByKey()));
  }


  public getRecipeMetadata(id: string): Observable<RecipeMetadata> {
    return objectVal(ref(this.database, `${TableName.RECIPE_METADATA}/${id}`));
  }


  public resolveUrl(query: string): ResolvedUrl | null {
    let url: URL;

    try {
      url = new URL(query);
    } catch (e) {
      return null;
    }

    return {
      id: url.hostname.replace(/^www\./, '').replace(/\./g, '_') + url.pathname.replace(/\/$/g, '').replace(/(\.|\/)/g, '_'),
      url: `${url.origin}${url.pathname}`,
    };
  }


  public addToRecentRecipes(id: string) {
    const recent = [
      ...new Set([ id, ...(this.getRecentRecipeIds() ?? [])])
    ].slice(0, 10);
    try {
      localStorage.setItem('recentRecipes', JSON.stringify(recent));
    } catch (e) {
      console.warn('Failed to save recent recipe list: ', e);
    }
  }

  public getRecentRecipes(): Observable<RecipeMetadata[]> {
    const recipeIds = this.getRecentRecipeIds();
    return recipeIds.length === 0 ? of([]) : combineLatest(
      recipeIds.map(id => this.getRecipeMetadata(id), startWith(null))
    ).pipe(
      map((values) => values.filter(v => v !== null))
    );
  }

  private getRecentRecipeIds(): string[] {
    try {
      return JSON.parse(localStorage.getItem('recentRecipes') ?? '[]');
    } catch (e) {
      console.warn('Failed to get recent recipe list: ', e);
      return [];
    }
  }

}
