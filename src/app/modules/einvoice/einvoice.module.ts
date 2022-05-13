import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EinvoiceTableResultComponent } from './pages/einvoice-table-result/einvoice-table-result.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { MatTableExporterModule } from 'mat-table-exporter';
import { EinvoiceRoutingModule } from './einvoice-routing.module';
import { EinvoiceSearchComponent } from './pages/einvoice-search/einvoice-search.component';
import { EinvoiceDetailsComponent } from './pages/einvoice-details/einvoice-details.component';



@NgModule({
  declarations: [ 
     EinvoiceTableResultComponent, 
     EinvoiceSearchComponent, 
     EinvoiceDetailsComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableExporterModule,
    NgSelectModule,
    NgxSpinnerModule,
    EinvoiceRoutingModule
  ],
  exports: [
    EinvoiceDetailsComponent,
    EinvoiceSearchComponent,
    EinvoiceTableResultComponent
  ]
})
export class EinvoiceModule { }
