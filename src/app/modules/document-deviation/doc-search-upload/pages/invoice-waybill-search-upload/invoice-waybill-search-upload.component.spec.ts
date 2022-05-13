import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceWaybillSearchUploadComponent } from './invoice-waybill-search-upload.component';

describe('InvoiceWaybillSearchUploadComponent', () => {
  let component: InvoiceWaybillSearchUploadComponent;
  let fixture: ComponentFixture<InvoiceWaybillSearchUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceWaybillSearchUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceWaybillSearchUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
