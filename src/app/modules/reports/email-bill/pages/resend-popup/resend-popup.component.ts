import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MAT_DIALOG_DATA } from '@angular/material';
import { EmailBillService } from '../../service/email-bill.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Branches } from '../../models/branches.model';
import { ResendEbillRequest } from '../../models/resend-ebill-request.model';
import { EbillSearchResult } from '../../models/ebill-search-result.model';
import { EmailBillRequest } from '../../models/email-bill-request.model';

@Component({
  selector: 'app-resend-popup',
  templateUrl: './resend-popup.component.html',
  styleUrls: ['./resend-popup.component.scss']
})
export class ResendPopupComponent implements OnInit {

  dialogType: string;
  allBranches: Branches[] = [];
  allFilteredBranches: Branches[] = [];
  branchSearchBy: string;
  ebillRequest : ResendEbillRequest = {
    billMonth : null,
    submissionBranchId: null,
    sfxCode: null,
    billingLevel: null,
    billingLevelCode: null

  };
  emailBillRequest : EmailBillRequest[] = [{
    documentId : null,
    documentNumber : null,
    documentType: null,
    outputFormat: "PDF"
  }];

  searchOptions = [{id: 1, name: 'BranchName'}, {id: 2, name: 'Region'}, {id: 3, name: 'Area'}];
  constructor(private _emailBillService: EmailBillService,
              private _spinner: NgxSpinnerService,
              private _toastr: ToastrService,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  displayedColumns: string[] = ['msa','sfxCode','rateCardCode','documentNumber','partyName','submissionBranchName','action'];
  dataSource: MatTableDataSource<EbillSearchResult> = new MatTableDataSource();
  //selection = new SelectionModel<Branches>(false, []);

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit() {
    this.loadData();
   }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadData() {
    this._spinner.show();
    this.ebillRequest = this.data.dataKey;
    console.log(this.ebillRequest);
    this._emailBillService.getResendBills(this.ebillRequest).subscribe(
      response => {
      this._spinner.hide();
      console.log(response);
      //const res = response.data;
      this.dataSource = new MatTableDataSource(response);
      this.ngAfterViewInit();
      },
      error => {
        this._spinner.hide();
        this._toastr.warning(error.message);
      }
    );
  }

  // search filter
  public applyFilter = (value: string) => {
    this.dataSource.filter = value.trim().toLocaleLowerCase();
    this.ngAfterViewInit();
  }

  resendEmail(documentNumber : string,documentType : string){
    this._spinner.show();
    this.emailBillRequest[0].documentNumber = documentNumber;
    this.emailBillRequest[0].documentType = documentType;
    this._emailBillService.sendEmailBills(this.emailBillRequest).subscribe(
      response => {
      this._spinner.hide();
      this._toastr.success("Email has been sent successfully");

      console.log(response);
      },
      error => {
        this._spinner.hide();
        this._toastr.warning(error.message);
      }
    );
     
  }

}
