import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoardRoutingModule } from './board-routing.module';
import { DefaultComponent } from './pages/default/default.component';
import { MedaiComponent } from './pages/medai/medai.component';


@NgModule({
  declarations: [
    DefaultComponent,
    MedaiComponent
  ],
  imports: [
    CommonModule,
    BoardRoutingModule
  ]
})
export class BoardModule { }
