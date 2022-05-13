import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptCancellationComponent } from './receipt-cancellation.component';

describe('ReceiptCancellationComponent', () => {
  let component: ReceiptCancellationComponent;
  let fixture: ComponentFixture<ReceiptCancellationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiptCancellationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptCancellationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
