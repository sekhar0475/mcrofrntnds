import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBranchesDialogComponent } from './add-branches-dialog.component';

describe('AddBranchesDialogComponent', () => {
  let component: AddBranchesDialogComponent;
  let fixture: ComponentFixture<AddBranchesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBranchesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBranchesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
