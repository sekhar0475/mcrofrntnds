import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { DefaultModule } from './layouts/default/default.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ModulesModule } from './modules/modules.module';
import { CoreModule } from './core/core.module';
import { ToastrModule } from 'ngx-toastr';
//import { MatTableExporterModule } from 'mat-table-exporter';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AutoLogoutService } from './core/autoLogOutService';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    DefaultModule,
    SharedModule,
    ModulesModule,
    CoreModule,
    FlexLayoutModule,
    ToastrModule,
    ToastrModule.forRoot()
  ],
  providers: [{provide: LocationStrategy, useClass: HashLocationStrategy},
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }],
  bootstrap: [AppComponent]
})
export class AppModule { }
