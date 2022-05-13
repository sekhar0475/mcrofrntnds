import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChangeBranchComponent } from './dialog-change-branch.component';

describe('DialogChangeBranchComponent', () => {
  let component: DialogChangeBranchComponent;
  let fixture: ComponentFixture<DialogChangeBranchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogChangeBranchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogChangeBranchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
