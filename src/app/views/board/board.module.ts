import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoardRoutingModule } from './board-routing.module';
import { DefaultComponent } from './pages/default/default.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestComponent } from './pages/test/test.component';
import { AgoraRTMServiceService } from 'src/app/services/agora-rtmservice.service';


@NgModule({
  declarations: [
    DefaultComponent,
    TestComponent
  ],
  imports: [
    CommonModule,
    BoardRoutingModule,
    FormsModule,
  ],
  providers: [
    AgoraRTMServiceService
  ]
})
export class BoardModule { }
