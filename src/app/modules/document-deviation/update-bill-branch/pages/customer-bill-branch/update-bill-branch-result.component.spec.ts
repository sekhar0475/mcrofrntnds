import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBillBranchResultComponent } from './update-bill-branch-result.component';

describe('UpdateBillBranchTableComponent', () => {
  let component: UpdateBillBranchResultComponent;
  let fixture: ComponentFixture<UpdateBillBranchResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateBillBranchResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateBillBranchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
