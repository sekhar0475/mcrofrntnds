import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceWriteOffComponent } from './invoice-write-off.component';

describe('InvoiceWriteOffComponent', () => {
  let component: InvoiceWriteOffComponent;
  let fixture: ComponentFixture<InvoiceWriteOffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceWriteOffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceWriteOffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
