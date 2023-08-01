import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultComponent } from './pages/default/default.component';
import { TestComponent } from './pages/test/test.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'test' },
  {
    path: 'default/:Un/:RID/:key',
    component: DefaultComponent,
  },
  {
    path: 'test',
    component: TestComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoardRoutingModule { }
