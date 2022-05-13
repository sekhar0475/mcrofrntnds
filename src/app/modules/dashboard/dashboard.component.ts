import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../login/services/token-storage.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BroadCastMsg } from 'src/app/shared/models/broadcast-msg.model';
/*const MODULESDATA = [
  {
    moduleName: 'Administration',
    moduleImage: 'settings',
    userSubmoduleList: [
        {
            submoduleName: 'User Mangement',
            submoduleUrl: '/user-management/users',
            readFlag: 'Y',
            writeFlag : 'N',
            updateFlag : 'N'
        },
        {
          submoduleName: 'Role Mangement',
          submoduleUrl: '/user-management/roles',
          readFlag: 'Y',
          writeFlag : 'Y',
          updateFlag : 'N'
      }
    ]
},
  {
      moduleName: 'Credit Billing',
      moduleImage: 'receipt',
      userSubmoduleList: [
          {
              submoduleName: 'Hold Auto Bill',
              submoduleUrl: '/billing/holdBill'
          },
          {
              submoduleName: 'Review Batches',
              submoduleUrl: '/billing/review'
          }
      ]
  },
  {
      moduleName: 'Collections',
      moduleImage: 'money',
      userSubmoduleList: [
          {
              submoduleName: 'Create Receipts',
              submoduleUrl: '/collection/receipt-create'
          },
          {
            submoduleName: 'Receipt Applications',
            submoduleUrl: '/collection/application-search'
        }
      ]
  },
  {
    moduleName: 'Credit / Debit Note',
    moduleImage: 'donut_small',
    userSubmoduleList: [
        {
            submoduleName: 'Credit Note',
            submoduleUrl: '/collection/receipt-create'
        },
        {
          submoduleName: 'Debit Note',
          submoduleUrl: '/collection/application-search'
      }
    ]
},
{
  moduleName: 'Document Deviation',
  moduleImage: 'description',
  userSubmoduleList: [
      {
          submoduleName: 'Invoice Write-Off',
          submoduleUrl: '/collection/receipt-create'
      },
      {
        submoduleName: 'Receipt Write-off',
        submoduleUrl: '/collection/receipt-create'
      },
      {
        submoduleName: 'Receipt Cancellation',
        submoduleUrl: '/collection/receipt-create'
      },
      {
        submoduleName: 'Waybill Write-off',
        submoduleUrl: '/collection/receipt-create'
      }
  ]
},
{
  moduleName: 'WMS Billing',
  moduleImage: 'note_add',
  userSubmoduleList: [
      {
          submoduleName: 'WMS Billing',
          submoduleUrl: '/billing/wms-billing'
      }
  ]
},
{
  moduleName: 'Allied Billing',
  moduleImage: 'library_add',
  userSubmoduleList: [
      {
          submoduleName: 'Allied Billing',
          submoduleUrl: '/collection/receipt-create'
      }
  ]
},
{
  moduleName: 'Submission Update',
  moduleImage: 'library_books',
  userSubmoduleList: [
      {
          submoduleName: 'Update Branch',
          submoduleUrl: '/collection/receipt-create'
      }
  ]
}
]; */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userModules: any[];
  greetings;
  userName;
  step = -1;
  // str: string = 'THIS IS A TEST MESSAGE LATEST UPDATES WILL BE SHOWN HERE';

  str: string = null;
  broadCastMsgList: BroadCastMsg[] =[];
  constructor(
    private _tokenStorage: TokenStorageService,
    public _toastr: ToastrService) { }
  ngOnInit() {
    this.setGreetings();
    this.getUserModules();
    this. getBroadCastMsg();
  }

  getUserModules() {
    this.userModules = this._tokenStorage.getUserModules();
  }

  // Set Greetings
  setGreetings() {
    const today = new Date();
    const curHr = today.getHours();
    this._tokenStorage.getCurrentUserName().subscribe(
      response => {
        this.userName = response.toUpperCase();
      });
    if (curHr < 12) {
      this.greetings = 'Good Morning';
    } else if (curHr < 18) {
      this.greetings = 'Good Afternoon';
    } else {
      this.greetings = 'Good Evening';
    }
  }
  // On Clicking mat-panel-expansion-header
  whenClicked(i) {
    this.step = i;
  }
  // To close the mat-panel
  closePanel(i) {
    if (this.step !== i) {
      return false;
    } else {
      return true;
    }
  }

  // on router Link click
  OnNavigate(readFlag, writeFlag, updateFlag) {
    this._tokenStorage.setCurrentModuleReadFlag(readFlag);
    this._tokenStorage.setCurrentModuleWriteFlag(writeFlag);
    this._tokenStorage.setCurrentModuleUpdateFlag(updateFlag);
  }

  getBroadCastMsg() {
    this._tokenStorage.getBroadCastMsg().subscribe(res => {
      console.log(res);
      this.broadCastMsgList = res;
      if (res[0])
       this.str = res[0].broadcastMessage;
    });
  }
}
