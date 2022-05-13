import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillSubmissionDetailsComponent } from './bill-submission-details.component';

describe('BillSubmissionDetailsComponent', () => {
  let component: BillSubmissionDetailsComponent;
  let fixture: ComponentFixture<BillSubmissionDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillSubmissionDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillSubmissionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
