import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditCustomerSearchComponent } from './credit-customer-search.component';

describe('CreditCustomerSearchComponent', () => {
  let component: CreditCustomerSearchComponent;
  let fixture: ComponentFixture<CreditCustomerSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditCustomerSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditCustomerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
