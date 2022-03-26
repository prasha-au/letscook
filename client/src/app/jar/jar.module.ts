import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JarComponent } from './jar.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    JarComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class JarModule { }
