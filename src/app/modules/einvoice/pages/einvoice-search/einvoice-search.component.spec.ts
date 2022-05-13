import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EinvoiceSearchComponent } from './einvoice-search.component';

describe('EinvoiceSearchComponent', () => {
  let component: EinvoiceSearchComponent;
  let fixture: ComponentFixture<EinvoiceSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EinvoiceSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EinvoiceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
