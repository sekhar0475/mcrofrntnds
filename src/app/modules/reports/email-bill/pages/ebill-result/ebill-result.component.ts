import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { PrintSearchResult } from '../../../print-bill/models/print-search-result.model';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { EbillSearchRequest } from '../../models/ebill-search-request.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { EmailBillService } from '../../service/email-bill.service';
import { EbillSearchResult } from '../../models/ebill-search-result.model';
import { BranchDialogComponent } from '../branch-dialog/branch-dialog.component';
import { ResendPopupComponent } from '../resend-popup/resend-popup.component';
import { ResendEbillRequest } from '../../models/resend-ebill-request.model';
import { TestTable } from '../../models/test-table.model';

@Component({
  selector: 'app-ebill-result',
  templateUrl: './ebill-result.component.html',
  styleUrls: ['./ebill-result.component.scss']
})
export class EbillResultComponent implements OnChanges {
  searchResult: EbillSearchResult;
  displayedColumns: string[] = ['select', 'msa', 'sfxCode', 'rateCardCode', 'customerName', 'billGeneratedCount', 'emailSentCount', 'acknowledgeCount','sendingFailedCount'];
  dataSource: MatTableDataSource<EbillSearchResult> = new MatTableDataSource();
  selection = new SelectionModel<EbillSearchResult>(true, []);
  @Input() searchRequest : EbillSearchRequest;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //printBillRequest: PrintBillRequest[] = [];
  billMonth : string;
  submissionBranchId : number;
  sfxCode : string;
  ebillRequest : ResendEbillRequest = {
    billMonth : null,
    submissionBranchId: null,
    sfxCode: null,
    billingLevel: null,
    billingLevelCode: null

  };
  emailRequest : ResendEbillRequest[] = [{
    billMonth : null,
    submissionBranchId: null,
    sfxCode: null,
    billingLevel: null,
    billingLevelCode: null

  }];
  constructor(private _dialog: MatDialog,private _spinner: NgxSpinnerService, public _toastr: ToastrService, private _emailBillService: EmailBillService) { }
  
  
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.searchRequest);
    this.loadData();
  }
  
  loadData(){
    console.log(this.searchRequest);
    this._spinner.show();
    this._emailBillService.getBillsData(this.searchRequest).subscribe
      (
        success => {
          console.log(success);
          this.dataSource = new MatTableDataSource();
               
          success.forEach(element => {
            this.dataSource.data.push(element);
          });

          this.dataSource.paginator = this.paginator;
          this.selection.clear();
          this._spinner.hide();
        }, error => {
          this._spinner.hide();
          this.dataSource = new MatTableDataSource();
          this.dataSource.paginator = this.paginator;

          if (error.error != null) {
            if (error.error.errorCode === 'handled_exception') {
              this._toastr.warning((error.error.errorMessage));
            } else {
              this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
            }
          } else {
            this._toastr.warning(error.message);
          }
        }
      );
  }

  
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: EbillSearchResult): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.billingLevelCode}`;
  }

  /** Whether the number of selected elements matches the total number of rows. */
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



 openPopupEmailSend(billingLevel,billingLevelCode){
  console.log('opening'+billingLevel);
  this.ebillRequest.billMonth = this.searchRequest.billMonth
  this.ebillRequest.billingLevel = billingLevel
  this.ebillRequest.billingLevelCode = billingLevelCode
  this.ebillRequest.sfxCode = this.searchRequest.sfxCode
  this.ebillRequest.submissionBranchId = this.searchRequest.submissionBranchId
  const dialogRef = this._dialog.open(ResendPopupComponent, {
    height: '450px',
    width: '1300px',
     data: {
           dataKey: this.ebillRequest,
         }
   });
  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      if (result[0] != null) {
        console.log(result);
        
      }
    }
  }
  );

 }

 submit(){
  if (this.selection.selected.length > 0) {
    this._spinner.show();
    this.emailRequest = [];
  this.selection.selected.forEach(element => {
    this.emailRequest.push({
      billMonth : this.searchRequest.billMonth,
      submissionBranchId: this.searchRequest.submissionBranchId,
      sfxCode: this.searchRequest.sfxCode,
      billingLevel: element.billingLevel,
      billingLevelCode: element.billingLevelCode
    });
  });
  this._emailBillService.sendBulkEmails(this.emailRequest).subscribe(
    response => {
    this._spinner.hide();
    this._toastr.success("Email has been sent to all selected data.");
    },
    error => {
      this._spinner.hide();
      this._toastr.warning(error.message);
    }
  );
 }
}

}
