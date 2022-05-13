import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrintBillSearchComponent } from './print-bill/pages/print-bill-search/print-bill-search.component';
import { EbillSearchComponent } from './email-bill/pages/ebill-search/ebill-search.component';
import { CustomerLedgerComponent } from './pages/customer-ledger/customer-ledger.component';
import { GstrReportsComponent } from './pages/gstr-reports/gstr-reports.component';
import { InvoiceAnnexureReportComponent } from './pages/invoice-annexure-report/invoice-annexure-report.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }, {
    path: 'print/bill',
    component: PrintBillSearchComponent,
    data: {
      breadcrumb: 'Print-bill',
    },
  }, {
    path: 'email/bill',
    component: EbillSearchComponent,
    data: {
      breadcrumb: 'Email-bill',
    },
  }, {
    path: 'customer-ledger',
    component: CustomerLedgerComponent,
    data: {
      breadcrumb: 'Customer Ledger',
    },
  }, {
    path: 'gstr-report',
    component: GstrReportsComponent,
    data: {
      breadcrumb: 'GSTR Reports',
    },
  }, {
    path: 'invoice-annexure-report',
    component: InvoiceAnnexureReportComponent,
    data: {
      breadcrumb: 'Invoice Details Annexure Report',
    },
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule {

}
