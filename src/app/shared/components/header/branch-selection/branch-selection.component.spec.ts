import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchSelectionComponent } from './branch-selection.component';

describe('BranchSelectionComponent', () => {
  let component: BranchSelectionComponent;
  let fixture: ComponentFixture<BranchSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BranchSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
