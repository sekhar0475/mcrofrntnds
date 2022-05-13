import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { Role } from '../../../role/models/role.model';
import { SelectionModel } from '@angular/cdk/collections';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  templateUrl: './add-role-dialog.component.html',
  styleUrls: ['./add-role-dialog.component.scss']
})
export class AddRoleDialogComponent implements OnInit, AfterViewInit {
  constructor(private userService: UserService,
              private spinner: NgxSpinnerService,
              private toastr: ToastrService) { }

  displayedColumns: string[] = ['select', 'roleName'
    , 'description'];

  dataSource: MatTableDataSource<Role> = new MatTableDataSource();
  selection = new SelectionModel<Role>(true, []);
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
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

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Role): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
  }

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  loadData() {
    this.spinner.show();
    this.userService.getAllRoles().subscribe(
      response => {
        this.spinner.hide();
        this.dataSource = new MatTableDataSource(response);
        this.dataSource.paginator = this.paginator;
      },
      error => {
        this.spinner.hide();
        this.toastr.warning(error.message);
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  AddUserRoles() {
    this.selection.selected.forEach(
    selectedRole => {});
}

}
