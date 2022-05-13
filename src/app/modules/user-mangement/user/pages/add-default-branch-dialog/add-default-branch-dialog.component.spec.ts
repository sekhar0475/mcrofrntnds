import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDefaultBranchDialogComponent } from './add-default-branch-dialog.component';

describe('AddDefaultBranchDialogComponent', () => {
  let component: AddDefaultBranchDialogComponent;
  let fixture: ComponentFixture<AddDefaultBranchDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDefaultBranchDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDefaultBranchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
