import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { ReceiptService } from '../../../services/receipt.service';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ReceiptSummary } from '../../../models/receiptSummary.model';
import { ReceiptSearch } from '../../../models/receiptSearch.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';
import { MatSort } from '@angular/material';

@Component({
  selector: 'app-receipt-table',
  templateUrl: './receipt-table.component.html',
  styleUrls: ['./receipt-table.component.scss']
})
export class ReceiptTableComponent implements OnInit, AfterViewInit {

  @Input()
  unApply = false;
  attachment = false;
  writeAccess = true;
  childCurrentValue: ReceiptSearch[] = [];
  fromDate = '';
  toDate = '';
  receiptNumber = '';
  clearSearchValues: ReceiptSearch = {} as ReceiptSearch;

  dataSource: MatTableDataSource<ReceiptSummary> = new MatTableDataSource();

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  displayedColumns: string[] = ['receiptNumber', 'receiptDate', 'insmtRef', 'customerName', 'outstandingAmt', 'appliedAmt', 'action'];
  constructor(private _receiptService: ReceiptService,
              private _router: Router,
              public _toastr: ToastrService,
              private _spinner: NgxSpinnerService,
              private _tokenStorage: TokenStorageService) { }

  ngOnInit() {
    this.setPermissions();
  }

   // set the permissions
   setPermissions() {
    // set the user access
    const path = this._router.url;
    const routerPart = path.split('/');
    let i = 0;
    let routeUrl;
    for (i = 1; i < routerPart.length && i <= 2; i++) {
      routeUrl = i == 1 ? '/' + routerPart[i] + '/' : routeUrl + routerPart[i];
    }
    this._tokenStorage.getAccess(routeUrl);
    if (this._tokenStorage.getCurrentModuleWriteFlag() != null && this._tokenStorage.getCurrentModuleWriteFlag() === 'Y') {
      this.writeAccess = true;
      return;
    } else if (this._tokenStorage.getCurrentModuleUpdateFlag() != null && this._tokenStorage.getCurrentModuleUpdateFlag() === 'Y') {
      this.writeAccess = false;
      return;
    } else {
      this.writeAccess = false;
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  // to convert system generated date for search in database
  convert(str) {
    if (str) {
      const date = new Date(str);
      const mnth = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return [date.getFullYear(), mnth, day].join('-');
    } else {
      return '';
    }
  }
  getSearchVal(selected: any) {
    if (selected) {
      this.childCurrentValue = selected;
      // since single array will be there dirctly adding values
      this.fromDate = this.childCurrentValue['fromDate'.toString()];
      this.toDate = this.childCurrentValue['toDate'.toString()];
      this.receiptNumber = this.childCurrentValue['receiptNumber'.toString()] == null ? '' :
      this.childCurrentValue['receiptNumber'.toString()];

      //  call get method once varibales are assigned on click search from child
      this.loadData();
    }
  }

  // load recipt data to table
  loadData() {
    this._spinner.show();
    this._receiptService.getReceiptData(this.unApply, this.convert(this.fromDate)
      , this.convert(this.toDate), this.receiptNumber).subscribe(
        response => {
          this._spinner.hide();
          this.dataSource = new MatTableDataSource(response);
          this.ngAfterViewInit();
        },
        error => {
          this._spinner.hide();
          console.log(error);
          if (error.error.errorCode != null) {
            this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
          } else {
            this._toastr.warning(error.message);
          }
        }
      );
  }

  applyReceiptWithId(receiptId: number) {
    if (this.unApply) {
      this.attachment = true;
      this._router.navigate(['collection/receipt-unapply', receiptId]);
    } else {
      this._router.navigate(['collection/receipt-apply', receiptId]);
     }
}
}
