import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateComponent } from './receipt/pages/create/create.component';
import { ApplicationComponent } from './receipt/pages/application/application.component';
import { ReceiptTableComponent } from './receipt/pages/application/receipt-table/receipt-table.component';
import { UnapplicationComponent } from './receipt/pages/unapplication/unapplication.component';
import { SearchReceiptComponent } from './receipt/pages/unapplication/search-receipt/search-receipt.component';

const routes: Routes = [
  {
  path: '',
  redirectTo: '/dashboard',
    pathMatch: 'full'
  }, {
    path: 'receipt-create',
    component: CreateComponent,
    data: {
      breadcrumb: 'Create Receipts',
  },
  },
  {
    path: 'receipt-apply/:id',
    component: ApplicationComponent,
    data: {
      breadcrumb: 'Receipt Application',
  },
  },
  {
    path: 'application-search',
    component: ReceiptTableComponent,
    data: {
      breadcrumb: 'Search Receipt',
  }
 },
  {
    path: 'unapplication-search',
    component: SearchReceiptComponent,
    data: {
      breadcrumb: 'Search Receipt',
  },
  },
  {
    path: 'receipt-unapply/:id',
    component: UnapplicationComponent ,
    data: {
      breadcrumb: 'Receipt Un-Application',
  },
  },
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollectionRoutingModule { }
