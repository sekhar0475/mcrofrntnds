import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DefaultComponent} from './default.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [
    DefaultComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    NgxSpinnerModule
  ]
})
export class DefaultModule { }
