import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import { ConstantsService } from './services/constant-service/constants.service';
import { AlertModule, AlertService } from './modules/alert';
import { LoadingComponent } from './components/loading/loading.component';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { BranchSelectionComponent } from './components/header/branch-selection/branch-selection.component';
import { ConfirmationSuccessDialogComponent } from './components/confirmation-success-dialog/confirmation-success-dialog.component';
import { FormatTimePipe, LogoutCountdownComponent } from './components/logout-countdown/logout-countdown.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent, 
    LoadingComponent, 
    BreadcrumbComponent, 
    ConfirmationDialogComponent,
    ErrorDialogComponent, 
    BranchSelectionComponent, 
    ConfirmationSuccessDialogComponent, 
    LogoutCountdownComponent,
    FormatTimePipe
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    AlertModule,
    RouterModule,
	  FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    MaterialModule,
    HeaderComponent, 
    FooterComponent, 
    SidebarComponent,
    AlertModule,
    LoadingComponent,
    BreadcrumbComponent,
    MatExpansionModule
  ],
  providers: [ConstantsService,AlertService],
  entryComponents: [ConfirmationDialogComponent,ErrorDialogComponent,BranchSelectionComponent, ConfirmationSuccessDialogComponent, LogoutCountdownComponent]

})
export class SharedModule { }
