import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { JarComponent } from './jar/jar.component';
import { LoaderComponent } from './loader/loader.component';
import { RecipeComponent } from './recipe/recipe.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'load',
    component: LoaderComponent,
  },
  {
    path: 'jar',
    component: JarComponent,
  },
  {
    path: 'recipe/:id',
    component: RecipeComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
