import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from 'src/app/modules/login/services/token-storage.service';

/*
const MODULESDATA = [
  {
    moduleName: 'Credit Bill',
    moduleImage: 'bill-32.png',
    userSubmoduleList: [
      {
        submoduleName: 'Hold Auto Bill',
        submoduleUrl: '/billing/holdBill'
      },
      {
        submoduleName: 'Review Batches',
        submoduleUrl: '/billing/review'
      }, {
        submoduleName: 'Create Bill Batch',
        submoduleUrl: '/billing/create'
      },

      {
        submoduleName: 'Finalize Batches',
        submoduleUrl: '/billing/finalize'
      },
      {
        submoduleName: 'Discount Bills',
        submoduleUrl: '/billing/discount'
      }
    ]
  },
  {
    moduleName: 'Administration',
    moduleImage: 'add-list-32.png',
    userSubmoduleList: [
      {
        submoduleName: 'User Mangement',
        submoduleUrl: '/user-management/users'
      },
      {
        submoduleName: 'Role Mangement',
        submoduleUrl: '/user-management/roles'
      }
    ]
  },
  {
    moduleName: 'Collections',
    moduleImage: 'add-list-32.png',
    userSubmoduleList: [
      {
        submoduleName: 'Create Receipts',
        submoduleUrl: '/collection/receipt-create'
      },
      {
        submoduleName: 'Receipt Applications',
        submoduleUrl: '/collection/application-search'
      }, {
        submoduleName: 'Receipt Unpplications',
        submoduleUrl: '/collection/unapplication-search'
      }
    ]
  }
];*/

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})


export class SidebarComponent implements OnInit {

  constructor(private _tokenStorage: TokenStorageService,
              public _toastr: ToastrService) { }
  userModules: any[];

  @Output()
  sidebarActiveStatus: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {
    this.getUserModules();
  }

  // close the navigation bar
  closeSideNavBar(readFlag , writeFlag, updateFlag) {
    this._tokenStorage.setCurrentModuleReadFlag(readFlag);
    this._tokenStorage.setCurrentModuleUpdateFlag(updateFlag);
    this._tokenStorage.setCurrentModuleWriteFlag(writeFlag);
    this.sidebarActiveStatus.emit();
  }

  // get the modules details accessible by the user
  getUserModules() {
    this.userModules = this._tokenStorage.getUserModules();
  }

}
