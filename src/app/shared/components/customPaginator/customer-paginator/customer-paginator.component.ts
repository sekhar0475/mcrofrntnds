import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-customer-paginator',
  templateUrl: './customer-paginator.component.html',
  styleUrls: ['./customer-paginator.component.scss']
})
export class CustomerPaginatorComponent implements OnInit {

  constructor(private _spinner: NgxSpinnerService) {
  }

  ngOnInit() {
  }

  @Input() totalPages = 0;
  @Input() restToZero = 0;
  @Output() onPageChange: EventEmitter<number> = new EventEmitter();
  @Output() onShowAll: EventEmitter<number> = new EventEmitter();

  public pages: number [] = [];
  activePage: number;

  ngOnChanges(): any {
    console.log("Tot>",this.totalPages);
    console.log("Res>",this.restToZero);
    if (this.totalPages > 0 && this.restToZero > 0){
      this.activePage = 1;
    }else if( this.totalPages == 0 ){
      this.activePage = 0;}
    else if(this.restToZero == -1){
      this.activePage = this.totalPages;
    }
  }

  onClickPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
            this.activePage = pageNumber;
            this.onPageChange.emit(this.activePage);
      }
  }

  onShowAllClick(lastPageNum: number): void {
    this.activePage = lastPageNum
    this.onShowAll.emit(lastPageNum);
    // if (lastPageNum > 0){
    //   this._spinner.show();
    //   while(lastPageNum > this.activePage){
    //     this.onClickPage(this.activePage+1);
    //   }
    //   this._spinner.hide();
    // }
  }

}
