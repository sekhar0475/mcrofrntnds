import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from '../services/token-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  returnUrl: string;


  constructor(
    private loginService: LoginService,
    private route: ActivatedRoute,
    private router: Router,
    public _toastr: ToastrService,
    private _tokenStorage: TokenStorageService,
    private _spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.initForm();
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/dashboard';
  }

  // Init method of form to initialize it while loading
  initForm() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }


  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  // Login service call for user authentication
  loginProcess() {
    if (this.loginForm.valid) {
      this._spinner.show();
      this.loginService.login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe(result => {
          console.log('',result);
          // get usermodule details
          this.loginService.getUserModules(this.loginForm.value.email).subscribe(
            modulesData => {
              this._spinner.hide();
              this._tokenStorage.setUserModules(modulesData);
              this.router.navigate([this.returnUrl]);
            },
            error => {
              this._spinner.hide();
              console.log(error);
              if (error.error != null && error.error.errorCode != null) {
                  this._toastr.warning(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
                } else {
                  this._toastr.warning(error.message);
                }
            });
        }, error => {
          this._spinner.hide();
          console.log(error);
          if (error.error != null) {
            if (error.error.errorCode === 'unhandled_exception') {
              this._toastr.error(error.error.errorMessage + ' Details: ' + error.error.errorDetails);
            } else if (error.status == '401') {​​​​​
              this._toastr.error('Invalid login details. Please enter correct login details.', '401')
            }​​​​​
            else {​​​​​
              this._toastr.error(error.error.errorMessage);
            }​​​​​ 
          } else {
            this._toastr.error('UnExpected Exception: ' + error.message);
          }
      });
    }
  }
}
