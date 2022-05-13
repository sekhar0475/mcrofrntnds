import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DocumentSearch } from '../../../models/documentSearch.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ReceiptService } from '../../../services/receipt.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { PickDateAdapter, PICK_FORMATS } from 'src/app/core/date.adapter';

// for customer type
interface DocumentType {
  id: string;
  lookupVal: string,
  lookupDescription: string;
}

@Component({
  selector: 'app-document-search',
  templateUrl: './document-search.component.html',
  styleUrls: ['./document-search.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class DocumentSearchComponent implements OnInit {

  // for document Type LOV
  docTypeList: DocumentType[] = [];
  searchFormGroup: FormGroup;
  searchValues: DocumentSearch = {} as DocumentSearch;

  @Output() documentSearchVal: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _spinner : NgxSpinnerService,
              private _toastr : ToastrService,
              private _receiptService : ReceiptService ) { }

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  // load all data 
  loadData() {
    // get the lookup values.
    //this._spinner.show();
    this._receiptService.getLookupValuesByType('REC_APPL_DOC_TYPE').subscribe(
      response => {
       // this._spinner.hide();
        response.data.forEach(
          lkps => {
            this.docTypeList = [...this.docTypeList, { id: lkps.id, lookupVal: lkps.lookupVal, lookupDescription: lkps.descr }];
          });
      },
      error => {
   //   this._spinner.hide();
        this.handleError(error);
      });
  }

    // show error details.
    handleError(error) {
      if (error.error != null && error.error.errorMessage != null) {
        this._toastr.warning(error.error.errorMessage);
      } else {
        this._toastr.warning(error.message);
      }
    }

  initForm() {
    this.searchFormGroup = new FormGroup({
      docTypeFC: new FormControl('', [Validators.required]),
    });
  }

  // emits the data from child to parent table for search
  pickSearchData(searchData: any) {
    this.documentSearchVal.emit(searchData);
  }

  // to set the emitter values to parent
  pushValues() {    
    if (this.searchValues.documentType.includes('RETAIL_GST_INV') && this.searchValues.documentNumber == null) {
        this._toastr.warning('Please provide document number.');
    }
    else{
      this.pickSearchData(this.searchValues);
    }
    
  }

}
