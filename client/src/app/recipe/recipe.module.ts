import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeComponent } from './recipe.component';
import { IngredientsComponent } from './ingredients.component';
import { InstructionsComponent } from './instructions.component';
import { NotesComponent } from './notes.component';
import { RecipeViewComponent } from './reciepe-view.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    RecipeComponent,
    RecipeViewComponent,
    IngredientsComponent,
    InstructionsComponent,
    NotesComponent,
  ],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class RecipeModule { }
