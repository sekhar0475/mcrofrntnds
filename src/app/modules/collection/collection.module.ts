import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionRoutingModule } from './collection-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material';
import { ApplicationComponent } from './receipt/pages/application/application.component';
import { CreateComponent } from './receipt/pages/create/create.component';
import { DialogComponent } from './receipt/pages/create/dialog/dialog.component';
import { ReceiptHeaderComponent } from './receipt/pages/application/receipt-header/receipt-header.component';
import { DocumentSearchComponent } from './receipt/pages/application/document-search/document-search.component';
import { DocumentResultComponent } from './receipt/pages/application/document-result/document-result.component';
import { ReceiptTableComponent } from './receipt/pages/application/receipt-table/receipt-table.component';
import { UnapplicationComponent } from './receipt/pages/unapplication/unapplication.component';
import { SearchReceiptComponent } from './receipt/pages/unapplication/search-receipt/search-receipt.component';
import { ReceiptSearchComponent } from './receipt/pages/application/search-receipt/receipt-search.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { CreditCustomerSearchComponent } from './receipt/pages/create/credit-customer-search/credit-customer-search.component';
import { ApplicationReasonComponent } from './receipt/pages/application/document-result/application-reason/application-reason.component';
import { RetailCustomerSearchComponent } from './receipt/pages/create/retail-customer-search/retail-customer-search.component';


@NgModule({

  declarations: [
    ApplicationComponent
    , CreateComponent, DialogComponent,
    ReceiptSearchComponent, ReceiptHeaderComponent, DocumentSearchComponent
    , DocumentResultComponent, ReceiptTableComponent, UnapplicationComponent,
    SearchReceiptComponent,
    CreditCustomerSearchComponent,
    ApplicationReasonComponent,
    RetailCustomerSearchComponent],
  imports: [
    CommonModule,
    CollectionRoutingModule,
    RouterModule,
    SharedModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    NgSelectModule
  ],
  exports: [
  ],
  entryComponents: [DialogComponent, CreditCustomerSearchComponent, ApplicationReasonComponent, RetailCustomerSearchComponent]
})
export class CollectionModule { }
