import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BillingRoutingModule } from '../billing/billing-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableExporterModule } from 'mat-table-exporter';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ReportsRoutingModule } from './reports-routing.module';
import { PrintBillSearchComponent } from './print-bill/pages/print-bill-search/print-bill-search.component';
import { PrintBillResultComponent } from './print-bill/pages/print-bill-result/print-bill-result.component';
import { EbillSearchComponent } from './email-bill/pages/ebill-search/ebill-search.component';
import { EbillResultComponent } from './email-bill/pages/ebill-result/ebill-result.component';
import { ResendPopupComponent } from './email-bill/pages/resend-popup/resend-popup.component';
import { BranchDialogComponent } from './email-bill/pages/branch-dialog/branch-dialog.component';
import { CustomerLedgerComponent } from './pages/customer-ledger/customer-ledger.component';
import { GstrReportsComponent } from './pages/gstr-reports/gstr-reports.component';
import { InvoiceAnnexureReportComponent } from './pages/invoice-annexure-report/invoice-annexure-report.component';
import { CustomerSearchDialogComponent } from './pages/customer-ledger/customer-search-dialog/customer-search-dialog.component';
import { CustomerDialogComponent } from './pages/invoice-annexure-report/customer-dialog/customer-dialog.component';
import { JobResultDialogComponent } from './report-job/pages/job-result-dialog/job-result-dialog.component';
import { JobDialogSearchComponent } from './report-job/pages/job-dialog-search/job-dialog-search.component';


@NgModule({
  declarations: [
    PrintBillSearchComponent,
    PrintBillResultComponent,
    EbillSearchComponent,
    EbillResultComponent,
    ResendPopupComponent,
    BranchDialogComponent,
    CustomerLedgerComponent,
    GstrReportsComponent,
    InvoiceAnnexureReportComponent,
    CustomerSearchDialogComponent,
    CustomerDialogComponent,
    JobResultDialogComponent,
    JobDialogSearchComponent
  ],
  providers: [DatePipe],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableExporterModule,
    NgSelectModule,
    NgxSpinnerModule,
    ReportsRoutingModule
  ],
  entryComponents: [
    CustomerSearchDialogComponent,
    CustomerDialogComponent,
    BranchDialogComponent,
    ResendPopupComponent,
    JobDialogSearchComponent]
})
export class ReportsModule { }
