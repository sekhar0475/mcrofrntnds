import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EinvoiceDetailsComponent } from './einvoice-details.component';

describe('EinvoiceDetailsComponent', () => {
  let component: EinvoiceDetailsComponent;
  let fixture: ComponentFixture<EinvoiceDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EinvoiceDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EinvoiceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
