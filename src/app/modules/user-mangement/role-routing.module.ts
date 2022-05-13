import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateRoleComponent } from '../user-mangement/role/pages/create-role/create-role.component';
import { ViewRoleComponent} from '../user-mangement/role/pages/view-role/view-role.component';
import { SearchRoleComponent } from '../user-mangement/role/pages/search/search-role/search-role.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
      pathMatch: 'full'
    },
  {
    path: 'roles',
    data: {
      breadcrumb: 'Role Management',
  },
    children: [
      {
        path: 'createRole/:id',
        component : CreateRoleComponent,
        data: {
          breadcrumb: 'Create Role',
      },
      },
      {
        path: 'viewRole/:id',
        component : ViewRoleComponent,
        data: {
          breadcrumb: 'View Role',
      },
      },
      {
        path: '',
        component : SearchRoleComponent,
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
export class RoleRoutingModule { }
