import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EinvoiceDetailsComponent } from './pages/einvoice-details/einvoice-details.component';
import { EinvoiceSearchComponent } from './pages/einvoice-search/einvoice-search.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: ':documentType',
    data: {
      breadcrumb: 'Search Bills'
    },
    children: [
      {
        path: 'update/:documentId',
        component: EinvoiceDetailsComponent,
        data: {
          breadcrumb: 'Update Bill Details'
        }
      },
      {
        path: '',
        component: EinvoiceSearchComponent,
        data: {
          breadcrumb: ''
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EinvoiceRoutingModule { }
