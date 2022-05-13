import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Branches } from '../../models/branches.model';
import { SelectionModel } from '@angular/cdk/collections';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import {MAT_DIALOG_DATA} from '@angular/material';
import { EmailBillService } from '../../service/email-bill.service';

@Component({
  templateUrl: './branch-dialog.component.html',
  styleUrls: ['./branch-dialog.component.scss']
})
export class BranchDialogComponent implements OnInit, AfterViewInit {
  dialogType: string;
  allBranches: Branches[] = [];
  allFilteredBranches: Branches[] = [];
  branchSearchBy: string;
  finalBranchdata: Branches[] = [];
  billBranchId : string[] = [];
  collBranchId : string[] = [];
  submsnBranchId : string[] = [];

  searchOptions = [{id: 1, name: 'BranchName'}, {id: 2, name: 'Region'}, {id: 3, name: 'Area'}];
  constructor(private _emailBillService: EmailBillService,
              private _spinner: NgxSpinnerService,
              private _toastr: ToastrService,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  displayedColumns: string[] = ['select', 'branchName'];
  dataSource: MatTableDataSource<Branches> = new MatTableDataSource();
  selection = new SelectionModel<Branches>(false, []);

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

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
  checkboxLabel(row?: Branches): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
  }

  ngOnInit() {
    this.loadData();
   }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadData() {
    this._spinner.show();
    this._emailBillService.getAllBranches().subscribe(
      response => {
        this._spinner.hide();
      //console.log(response.data);
      const res = response;
      if(res){
        res.forEach(element => {
              this.finalBranchdata.push(element);
         });
        
        this.dataSource = new MatTableDataSource(this.finalBranchdata);
      }else{
        this.dataSource = new MatTableDataSource(res);
        
      }
      
        this.ngAfterViewInit();
      },
      error => {
        //this.spinner.hide();
        this._toastr.warning(error.message);
      }
    );
  }

  // search filter
  public applyFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
    this.ngAfterViewInit();
  }

  AddUserDefBranch() {
    this.selection.selected.forEach(
      selectedBranch => {});
}
}
