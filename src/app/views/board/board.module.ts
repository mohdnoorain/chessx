import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoardRoutingModule } from './board-routing.module';
import { DefaultComponent } from './pages/default/default.component';
import { MedaiComponent } from './pages/medai/medai.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DefaultComponent,
    MedaiComponent
  ],
  imports: [
    CommonModule,
    BoardRoutingModule,
    FormsModule
  ]
})
export class BoardModule { }
