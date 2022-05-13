import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateBillBranchResultComponent } from './update-bill-branch/pages/customer-bill-branch/update-bill-branch-result.component';
import { DialogChangeBranchComponent } from './update-bill-branch/pages/customer-bill-branch/dialog-branch/dialog-change-branch.component';
import { BranchDocumentSearchComponent } from './update-bill-branch/pages/branch-document-search/branch-document-search.component';
import { DocumentDeviationRoutingModule } from './document-deviation-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DocReceiptSearchComponent } from './doc-search-upload/pages/doc-receipt-search/doc-receipt-search.component';
import { InvoiceWriteOffComponent } from './invoice-write-off/pages/invoice-write-off/invoice-write-off.component';
import { WaybillWriteOffComponent } from './waybill-write-off/pages/waybill-write-off/waybill-write-off.component';
// tslint:disable-next-line: max-line-length
import { InvoiceWaybillSearchUploadComponent } from './doc-search-upload/pages/invoice-waybill-search-upload/invoice-waybill-search-upload.component';
import { ReceiptWriteOffComponent } from './receipt-write-off/pages/receipt-write-off/receipt-write-off.component';
import { ReceiptCancellationComponent } from './receipt-cancellation/pages/receipt-cancellation/receipt-cancellation.component';
import { UploadResultComponent } from './invoice-receipt-waybill-result/pages/upload-result/upload-result.component';
import { InputTableResultComponent } from './invoice-receipt-waybill-result/pages/input-table-result/input-table-result.component';
import { ReceiptCancelReasonComponent } from './invoice-receipt-waybill-result/pages/receipt-cancel-reason/receipt-cancel-reason.component';
import { NewReceiptComponent } from './invoice-receipt-waybill-result/pages/new-receipt/new-receipt.component';
import { DocumentBranchComponent } from './doc-search-upload/pages/document-branch/document-branch.component';
import { NewReceiptDialogComponent } from './invoice-receipt-waybill-result/pages/new-receipt/dialog/new-receipt-dialog.component';
import { MatTableExporterModule } from 'mat-table-exporter';



@NgModule({
  declarations: [
    UpdateBillBranchResultComponent,
    DialogChangeBranchComponent,
    BranchDocumentSearchComponent,
    InvoiceWaybillSearchUploadComponent,
    DocReceiptSearchComponent,
    UploadResultComponent,
    InputTableResultComponent,
    InvoiceWriteOffComponent,
    WaybillWriteOffComponent,
    ReceiptWriteOffComponent,
    ReceiptCancellationComponent,
    ReceiptCancelReasonComponent,
    NewReceiptComponent,
    DocumentBranchComponent,
    NewReceiptDialogComponent],
  imports: [
    CommonModule,
    DocumentDeviationRoutingModule,
    RouterModule,
    SharedModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    MatTableExporterModule,
],
  entryComponents: [DocumentBranchComponent , NewReceiptDialogComponent , DialogChangeBranchComponent]
})
export class DocumentDeviationModule {

}
