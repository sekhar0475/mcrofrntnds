import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceAnnexureReportComponent } from './invoice-annexure-report.component';

describe('InvoiceAnnexureReportComponent', () => {
  let component: InvoiceAnnexureReportComponent;
  let fixture: ComponentFixture<InvoiceAnnexureReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceAnnexureReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceAnnexureReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
