import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBillSubmissionComponent } from './bill-submission/pages/search-bill-submission/search-bill-submission.component';
import { BillSubmissionDetailsComponent } from './bill-submission/pages/bill-submission-details/bill-submission-details.component';
import { BillSubmissionRoutingModule } from './bill-submission-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';




@NgModule({
  declarations: [SearchBillSubmissionComponent, BillSubmissionDetailsComponent],
  imports: [
    CommonModule,
    BillSubmissionRoutingModule,
    RouterModule,
    SharedModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ]
})
export class BillSubmissionModule { }
