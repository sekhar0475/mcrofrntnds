import { CommonModule } from '@angular/common';
import { NgModule, } from '@angular/core';
import { BillingModule } from './billing/billing.module';
import { LoginModule } from './login/login.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DashboardModule } from './dashboard/dashboard.module';
import { CollectionModule } from './collection/collection.module';
import { ReportsModule } from './reports/reports.module';
import { EinvoiceModule } from './einvoice/einvoice.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LoginModule,
    BillingModule,
    FlexLayoutModule,
    DashboardModule,
    CollectionModule,
    ReportsModule,
    EinvoiceModule
  ]
})
export class ModulesModule { }
