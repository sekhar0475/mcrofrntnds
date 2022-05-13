import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SearchRoleComponent } from '../user-mangement/role/pages/search/search-role/search-role.component';
import { SearchUserComponent } from '../user-mangement/user/pages/search/search-user/search-user.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import { CreateRoleComponent } from './role/pages/create-role/create-role.component';
import { MatPaginatorModule, MatIconModule } from '@angular/material';
import { AdvancedFiltersPipe } from './role/services/advanced-filters.pipe';
import { ViewRoleComponent } from './role/pages/view-role/view-role.component';
import { UserRoutingModule } from './user-routing.module';
import { RoleRoutingModule } from './role-routing.module';
import { CreateUserComponent } from './user/pages/create-user/create-user.component';
import { ViewUserComponent } from './user/pages/view-user/view-user.component';
import { AddRoleDialogComponent } from './user/pages/add-role-dialog/add-role-dialog.component';
import { AddBranchesDialogComponent } from './user/pages/add-branches-dialog/add-branches-dialog.component';
import { AddDefaultBranchDialogComponent } from './user/pages/add-default-branch-dialog/add-default-branch-dialog.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrModule } from 'ngx-toastr';
import {TextInputAutocompleteModule } from 'angular-text-input-autocomplete';

@NgModule({
  declarations: [SearchRoleComponent,
    SearchUserComponent,
    CreateRoleComponent,
    AdvancedFiltersPipe,
    ViewRoleComponent,
    CreateUserComponent,
    ViewUserComponent,
    AddRoleDialogComponent,
    AddRoleDialogComponent,
    AddBranchesDialogComponent,
    AddDefaultBranchDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatExpansionModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule,
    MatSelectModule,
    MatPaginatorModule,
    MatIconModule,
    UserRoutingModule,
    RoleRoutingModule,
    NgSelectModule,
    ToastrModule,
    ToastrModule.forRoot(),
    TextInputAutocompleteModule,
  ],
  entryComponents: [AddRoleDialogComponent,
                    AddBranchesDialogComponent,
                    AddDefaultBranchDialogComponent],
  exports: [
    SearchRoleComponent,
    SearchUserComponent
  ],
  providers: []
 })
export class UserManagementModule { }
