import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultComponent } from './pages/default/default.component';
import { MedaiComponent } from './pages/medai/medai.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'default' },
  {
    path: 'default',
    component: DefaultComponent,
  },
  {
    path: 'media',
    component: MedaiComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoardRoutingModule { }
