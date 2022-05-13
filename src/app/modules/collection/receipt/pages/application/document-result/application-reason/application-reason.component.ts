import { Component, OnInit, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-application-reason',
  templateUrl: './application-reason.component.html',
  styleUrls: ['./application-reason.component.scss']
})
export class ApplicationReasonComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['select', 'viewValue'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  selection = new SelectionModel<any>(true, []);

  constructor(
    public dialogRef: MatDialogRef<ApplicationReasonComponent>,
    @Inject(MAT_DIALOG_DATA) public reasonList: any[]) {
    this.dataSource = new MatTableDataSource(this.reasonList);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {
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
