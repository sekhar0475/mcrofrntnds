import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BillBranch } from '../../models/bill-branch.model';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-branch-search',
  templateUrl: './branch-search.component.html',
  styleUrls: ['./branch-search.component.scss']
})
export class BranchSearchComponent implements OnInit {

  displayedColumns: string[] = ['select','branchName'];
  dataSource: MatTableDataSource<BillBranch> = new MatTableDataSource();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  selection = new SelectionModel<any>(true, []);

  constructor(
    public dialogRef: MatDialogRef<BranchSearchComponent>,
    @Inject(MAT_DIALOG_DATA) public customerList: BillBranch[]) {
      this.dataSource = new MatTableDataSource(this.customerList);
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
