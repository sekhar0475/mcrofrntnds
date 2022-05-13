import { Component, OnInit, ViewChild, Inject, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Customer } from '../../../models/customer';
import { SelectionModel } from '@angular/cdk/collections';
import { CreditCustomerSearchComponent } from '../credit-customer-search/credit-customer-search.component';

@Component({
  selector: 'app-retail-customer-search',
  templateUrl: './retail-customer-search.component.html',
  styleUrls: ['./retail-customer-search.component.scss']
})
export class RetailCustomerSearchComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['select', 'customerName'];
  dataSource: MatTableDataSource<Customer> = new MatTableDataSource();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  selection = new SelectionModel<any>(true, []);
  constructor(
    public dialogRef: MatDialogRef<RetailCustomerSearchComponent>,
    @Inject(MAT_DIALOG_DATA) public customerList: Customer[]) {
    this.dataSource = new MatTableDataSource(this.customerList);
  }
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  // search filter
  public applyFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
  }

}
