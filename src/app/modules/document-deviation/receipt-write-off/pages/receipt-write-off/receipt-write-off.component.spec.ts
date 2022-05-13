import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptWriteOffComponent } from './receipt-write-off.component';

describe('ReceiptWriteOffComponent', () => {
  let component: ReceiptWriteOffComponent;
  let fixture: ComponentFixture<ReceiptWriteOffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiptWriteOffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptWriteOffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
