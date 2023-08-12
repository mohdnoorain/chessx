import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultComponent } from './pages/default/default.component';
import { TestComponent } from './pages/test/test.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'test' },
  {
    path: 'default/:Un/:cId',
    component: DefaultComponent,
  },
  {
    path: 'default/:Un',
    component: DefaultComponent,
  },
  {
    path: 'test/:cId',
    component: TestComponent,
  },
  {
    path: 'test',
    component: TestComponent,
  },
  {path:"**",redirectTo:'test'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoardRoutingModule { }
