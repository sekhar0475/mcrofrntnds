import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CustomerLedgerService } from 'src/app/modules/reports/pages/customer-ledger/service/customer-ledger.service';
import { SelectionModel } from '@angular/cdk/collections';
import { WmsService } from '../../services/wms.service';
import { CustByNameRequest } from '../../models/cust-by-name-request.model';

@Component({
  selector: 'app-customer-search-dialog',
  templateUrl: './customer-search-dialog.component.html',
  styleUrls: ['./customer-search-dialog.component.scss']
})
export class CustomerSearchDialogComponent implements OnInit {

  constructor(public _toastr: ToastrService,
    private _spinner: NgxSpinnerService,
    private _ledgerService: CustomerLedgerService,private _wmsService: WmsService) { }
request : CustByNameRequest={
  custName :"",
  email:"",
  gstinNum:"",
  groupCode:"",
  pan:"",
  sfdcAccId:""
};
showError = true;
custArray : CustomerDetails[] = [];
displayedColumns: string[] = ['select','msaName', 'propelMsaCode'];
dataSource: MatTableDataSource<CustomerDetails> = new MatTableDataSource();
selection = new SelectionModel<CustomerDetails>(true, []);
@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
ngOnInit() {
}


ngAfterViewInit() {
this.dataSource.paginator = this.paginator;
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

checkboxLabel(row?: CustomerDetails): string {
if (!row) {
return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
}
}

// to show 3 characters are mandatory.
onKeyup(searchValLength: number ) {
if (searchValLength < 3) {
this.showError = true;
} else {
this.showError = false;
}
}

// on Go Button click
onClickGo(searchValue){
this._spinner.show();
this.request.custName = searchValue;
this._wmsService.getCustomerByName(this.request).subscribe(
response=>{
this._spinner.hide();
if(response.status === 'SUCCESS'){
  const custData = response.data.wmsCntrResp;
  console.log(custData);
  this.custArray = [];
  if(custData.length > 0){
    custData.forEach(eachCust => {
      //if(eachCust.accType === 'CREDIT'){
        
        this.custArray.push(
          {id : null,
          propelMsaCode : eachCust.groupCode,
          msaName : eachCust.custName,
          billingInfo : null,
          aliasName : eachCust.cntrType,
          billConfigId : null
          }
        );
     // }
    });
  }
}
console.log(this.custArray);
this.dataSource = new MatTableDataSource(this.custArray);
this.ngAfterViewInit();
},
error=>{
this._spinner.hide();
if (error.error != null) {
  this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
} else {
  this._toastr.warning(error.message);
}
}

);
}

}
