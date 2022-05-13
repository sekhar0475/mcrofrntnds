import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptCancelReasonComponent } from './receipt-cancel-reason.component';

describe('ReceiptCancelReasonComponent', () => {
  let component: ReceiptCancelReasonComponent;
  let fixture: ComponentFixture<ReceiptCancelReasonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiptCancelReasonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptCancelReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
