import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Branches } from 'src/app/modules/billing/allied/models/branches.model';
import { RandomBillingService } from '../../../services/random-billing.service';

@Component({
  selector: 'app-branches-dailog',
  templateUrl: './branches-dailog.component.html',
  styleUrls: ['./branches-dailog.component.scss']
})
export class BranchesDailogComponent implements OnInit, AfterViewInit {
  dialogType: string;
  allBranches: Branches[] = [];
  allFilteredBranches: Branches[] = [];
  branchSearchBy: string;
  finalBranchdata: Branches[] = [];
  billBranchId: string[] = [];
  collBranchId: string[] = [];
  submsnBranchId: string[] = [];
  billByOptionId: string[] = [];

  constructor(private randomService: RandomBillingService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  displayedColumns: string[] = ['select', 'branchName'];
  dataSource: MatTableDataSource<Branches> = new MatTableDataSource();
  selection = new SelectionModel<Branches>(false, []);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

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

    this.data.dataKey.forEach(element => {
      this.billBranchId.push(element.blngBrId);
      this.collBranchId.push(element.collBrId);
      this.submsnBranchId.push(element.submsnBrId);
      this.billByOptionId.push(element.billingByOptionId);

    });

    this.loadData();
    console.log(this.data.dataKey);
      

      console.log(this.billBranchId);
      
      console.log(this.submsnBranchId);
      
      console.log(this.submsnBranchId);
  }
  
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadData() {
    this.spinner.show();
    this.randomService.getAllBranches().subscribe(
      response => {
        this.spinner.hide();
        const res = response;
        console.log(res);
          res.forEach(element => {
            if (this.data.openFrom === "billBranch") {
              if (this.billBranchId.includes(element.branchId)) {
                this.finalBranchdata.push(element);
              } 
            }
            if (this.data.openFrom === "collBranch") {
              if (this.collBranchId.includes(element.branchId)) {
                this.finalBranchdata.push(element);
              } 
            }
            if (this.data.openFrom === "submsnBranch") {
              if (this.submsnBranchId.includes(element.branchId)) {
                this.finalBranchdata.push(element);
              } 
            }
          });
        this.dataSource = new MatTableDataSource(this.finalBranchdata);
        this.ngAfterViewInit();
      },
      error => {
        this.spinner.hide();
        this.toastr.warning(error.message);
      }
    );
  }

  // search filter
  public applyFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
    this.ngAfterViewInit();
  }
}