import { CustomerPaginatorComponent } from './../../shared/components/customPaginator/customer-paginator/customer-paginator.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingRoutingModule } from './billing-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateBillingSearchComponent } from './wms/pages/create-billing-search/create-billing-search.component';
import { CreateBillingResultComponent } from './wms/pages/create-billing-result/create-billing-result.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomDatePipe } from 'src/app/shared/Pipes/custom.datepipe';
import { CreateManualBatchComponent } from './manual/pages/create-manual-batch/create-manual-batch.component';
import { CreateManualSearchComponent } from './manual/pages/create-manual-search/create-manual-search.component';
import { BatchReviewComponent } from './review/pages/batch-review/batch-review.component';
import { SearchAutoHoldBillComponent } from './auto-hold-bill/pages/search-hold-bill/search-auto-hold-bill.component';
import { AutoBillHoldComponent } from './auto-hold-bill/pages/auto-bill-hold/auto-bill-hold.component';
import { ReviewSearchComponent } from './review/pages/review-search/review-search.component';
import { FinalizeSearchComponent } from './finalize/pages/finalize-search/finalize-search.component';
import { FinalizeComponent } from './finalize/pages/finalize-table/finalize.component';
import { DiscountSearchComponent } from './discount/pages/discount-search/discount-search.component';
import { DiscountComponent } from './discount/pages/discount-table/discount.component';
import { CustomerSearchComponent } from './wms/pages/customer-search/customer-search.component';
import { BranchSearchComponent } from './wms/pages/branch-search/branch-search.component';
import { CmdmSearchComponent } from './cmdm/pages/cmdm-search/cmdm-search.component';
import { CmdmSearchResultComponent } from './cmdm/pages/cmdm-search-result/cmdm-search-result.component';
import { BranchDialogComponent } from './allied/pages/branch-dialog/branch-dialog.component';
import { CreateComponent } from './allied/pages/create/create.component';
import { LinesComponent } from './allied/pages/create/lines/lines.component';
import { MatTableExporterModule } from 'mat-table-exporter';
import { ReviewResultComponent } from './review/pages/review-result/review-result.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CustomerSearchDialogComponent } from './wms/pages/customer-search-dialog/customer-search-dialog.component';
import { CreditRandomSearchComponent } from './random/pages/credit-random/credit-random-search.component';
import { CreditRandomResultComponent } from './random/pages/credit-random-result/credit-random-result.component';
import { BranchesDailogComponent } from './random/pages/credit-random/branches-dailog/branches-dailog.component';

@NgModule({
  declarations: [
      CustomDatePipe
    , ReviewResultComponent
    , AutoBillHoldComponent
    , CreateBillingSearchComponent
    , CreateBillingResultComponent
    , CreateManualBatchComponent
    , CreateManualSearchComponent
    , DiscountSearchComponent
    , DiscountComponent
    , FinalizeSearchComponent
    , FinalizeComponent
    , BatchReviewComponent
    , ReviewSearchComponent
    , CustomerPaginatorComponent
    , SearchAutoHoldBillComponent
    , CustomerSearchComponent
    , BranchSearchComponent
    , CmdmSearchComponent
    , CmdmSearchResultComponent
    , CreateComponent
    , LinesComponent
    , BranchDialogComponent, CustomerSearchDialogComponent, CreditRandomSearchComponent, CreditRandomResultComponent, BranchesDailogComponent],

  imports: [
    CommonModule,
    BillingRoutingModule,
    RouterModule,
    SharedModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableExporterModule,
    NgSelectModule,
    NgxSpinnerModule
  ],
  exports: [
    CustomerPaginatorComponent
  ],
  entryComponents: [
    CustomerSearchComponent
    , BranchSearchComponent
    , BranchDialogComponent,CustomerSearchDialogComponent,
    BranchesDailogComponent]
})
export class BillingModule { }
