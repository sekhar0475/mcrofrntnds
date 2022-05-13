import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DefaultComponent } from './layouts/default/default.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { LoginComponent } from './modules/login/pages/login.component';
import { AuthGuard } from './core/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component : LoginComponent
  },
  {
    path: '',
    component: DefaultComponent,
    data: {
      breadcrumb: '',
    },
    children: [
      {
        path: 'dashboard',
        component : DashboardComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'billing',
        data: {
          breadcrumb: 'Dashboard',
        },
        loadChildren: './modules/billing/billing.module#BillingModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'collection',
        data: {
          breadcrumb: 'Dashboard',
        },
        loadChildren: './modules/collection/collection.module#CollectionModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'document-deviation',
        data: {
          breadcrumb: 'Dashboard',
        },
        loadChildren: './modules/document-deviation/document-deviation.module#DocumentDeviationModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'user-management',
        data: {
          breadcrumb: 'Dashboard',
        },
        loadChildren: './modules/user-mangement/user-management.module#UserManagementModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'update-submission',
        data: {
          breadcrumb: 'Dashboard',
        },
        loadChildren: './modules/bill-submission/bill-submission.module#BillSubmissionModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'reports',
        data: {
          breadcrumb: 'Dashboard',
        },
        loadChildren: './modules/reports/reports.module#ReportsModule',        
      },
      {
         path: 'einvoice',
         data: {
           breadcrumb: 'Dashboard'
         },
         loadChildren: './modules/einvoice/einvoice.module#EinvoiceModule',
         canActivate: [AuthGuard]
       }
    ]
  }
  ,
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
