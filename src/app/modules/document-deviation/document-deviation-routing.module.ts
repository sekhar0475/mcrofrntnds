import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BranchDocumentSearchComponent } from './update-bill-branch/pages/branch-document-search/branch-document-search.component';
import { InvoiceWriteOffComponent } from './invoice-write-off/pages/invoice-write-off/invoice-write-off.component';
import { WaybillWriteOffComponent } from './waybill-write-off/pages/waybill-write-off/waybill-write-off.component';
import { ReceiptWriteOffComponent } from './receipt-write-off/pages/receipt-write-off/receipt-write-off.component';
import { ReceiptCancellationComponent } from './receipt-cancellation/pages/receipt-cancellation/receipt-cancellation.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    }, {
        path: 'updateBillBranch',
        component: BranchDocumentSearchComponent,
        data: {
          breadcrumb: 'Update Bill Branch',
      },
    }, {
        path: 'invoiceWriteOff',
        component: InvoiceWriteOffComponent,
        data: {
          breadcrumb: 'Invoice Write-Off',
      },
    }, {
        path: 'waybillWriteOff',
        component: WaybillWriteOffComponent,
        data: {
          breadcrumb: 'Waybill Write-Off',
      },
    }, {
        path: 'cancellation',
        component: ReceiptCancellationComponent,
        data: {
          breadcrumb: 'Receipt cancellation',
      },
    }, {
        path: 'writeOff',
        component: ReceiptWriteOffComponent,
        data: {
          breadcrumb: 'Receipt Write-off',
      },
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class DocumentDeviationRoutingModule { }
