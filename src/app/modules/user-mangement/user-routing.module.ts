import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateUserComponent } from '../user-mangement/user/pages/create-user/create-user.component';
import { ViewUserComponent } from '../user-mangement/user/pages/view-user/view-user.component';
import { SearchUserComponent } from '../user-mangement/user/pages/search/search-user/search-user.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
      pathMatch: 'full'
    },
  {
    path: 'users',
    data: {
      breadcrumb: 'User Management',
  },
    children: [
      {
        path: 'create-user/:id',
        component : CreateUserComponent,
        data: {
          breadcrumb: 'Create User',
      },
      },
      {
        path: 'view-user/:id',
        component : ViewUserComponent,
        data: {
          breadcrumb: 'View User',
      },
      },
      {
        path: '',
        component : SearchUserComponent,
        data: {
          breadcrumb: '',
      },
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
