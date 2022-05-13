import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AutoBillHoldComponent } from './auto-hold-bill/pages/auto-bill-hold/auto-bill-hold.component';
import { CreateBillingSearchComponent } from './wms/pages/create-billing-search/create-billing-search.component';
import { CreateBillingResultComponent } from './wms/pages/create-billing-result/create-billing-result.component';
import { BatchReviewComponent } from './review/pages/batch-review/batch-review.component';
import { CreateManualBatchComponent } from './manual/pages/create-manual-batch/create-manual-batch.component';
import { FinalizeComponent } from './finalize/pages/finalize-table/finalize.component';
import { DiscountComponent } from './discount/pages/discount-table/discount.component';
import { CmdmSearchComponent } from './cmdm/pages/cmdm-search/cmdm-search.component';
import { CreateComponent } from './allied/pages/create/create.component';
import { ReviewResultComponent } from './review/pages/review-result/review-result.component';
import { CreditRandomSearchComponent } from './random/pages/credit-random/credit-random-search.component';
import { EinvoiceDetailsComponent } from '../einvoice/pages/einvoice-details/einvoice-details.component';
import { EinvoiceSearchComponent } from '../einvoice/pages/einvoice-search/einvoice-search.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }, {
    path: 'review',
    component: ReviewResultComponent,
    data: {
      breadcrumb: 'Review',
    },
  },
  {
    path: 'holdBill',
    component: AutoBillHoldComponent,
    data: {
      breadcrumb: 'Hold Auto Billing',
    },
  },
  {
    path: 'allied/credit',
    component: CreateComponent,
    data: {
      breadcrumb: 'Credit',
    },
  },{
    path: 'allied/retail',
    component: CreateComponent,
    data: {
      breadcrumb: 'Retail',
    },
  },
  {
    path: 'wms-billing',
    component: CreateBillingSearchComponent,
    data: {
      breadcrumb: 'Wms Billing',
    },
  },
  {
    path: 'wmsResult',
    component: CreateBillingResultComponent,
    data: {
      breadcrumb: 'Wms Billing',
    },
  },
  {
    path: 'manual',
    component: CreateManualBatchComponent,
    data: {
      breadcrumb: 'Create Bill Batch',
    },
  },
  {
    path: 'finalize',
    component: FinalizeComponent,
    data: {
      breadcrumb: 'Finalize Batches',
    },
  },
  {
    path: 'discount',
    component: DiscountComponent,
    data: {
      breadcrumb: 'Discount Bills',
    },
  },
  {
    path: 'batchReview/:id',
    component: BatchReviewComponent,
    data: {
      breadcrumb: 'Batch Review',
    }
  },
  {
    path: 'cmdm/:documentSubType',
    component: CmdmSearchComponent,
    data: {
      breadcrumb: 'Credit Memo / Debit Memo',
    }
  },
  {
    path: 'random',
    component: CreditRandomSearchComponent,
    data: {
      breadcrumb: 'Random Credit Billing',
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingRoutingModule {

}
