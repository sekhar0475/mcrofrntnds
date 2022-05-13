import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptHeaderComponent } from './receipt-header.component';

describe('ReceiptHeaderComponent', () => {
  let component: ReceiptHeaderComponent;
  let fixture: ComponentFixture<ReceiptHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiptHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
