import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EinvoiceTableResultComponent } from './einvoice-table-result.component';

describe('EinvoiceTableResultComponent', () => {
  let component: EinvoiceTableResultComponent;
  let fixture: ComponentFixture<EinvoiceTableResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EinvoiceTableResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EinvoiceTableResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
