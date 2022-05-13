import { NgModule } from '@angular/core';

import {
  MatButtonModule,
  MatSidenavModule,
  MatDividerModule,
  MatToolbarModule,
  MatIconModule,
  MatMenuModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatListModule,
  MatGridListModule,
  MatTabsModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  MatExpansionModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatTableModule,
  MatCheckboxModule,
  MatDialogModule,
  MatPaginatorModule,
  MatSortModule,
  MatAutocompleteModule,
  MatRadioModule,
  MatTooltipModule
} from '@angular/material';

const material = [
  MatButtonModule,
  MatSidenavModule,
  MatDividerModule,
  MatToolbarModule,
  MatIconModule,
  MatMenuModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatListModule,
  MatGridListModule,
  MatTabsModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  MatExpansionModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatTableModule,
  MatCheckboxModule,
  MatInputModule,
  MatDialogModule,
  MatPaginatorModule,
  MatSortModule,
  MatAutocompleteModule,
  MatRadioModule,
  MatTooltipModule
  ];

@NgModule({
  imports: [
    material
  ],
  exports : [
    material
  ]
})
export class MaterialModule { }
