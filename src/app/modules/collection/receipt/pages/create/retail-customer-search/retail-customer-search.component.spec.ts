import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailCustomerSearchComponent } from './retail-customer-search.component';

describe('RetailCustomerSearchComponent', () => {
  let component: RetailCustomerSearchComponent;
  let fixture: ComponentFixture<RetailCustomerSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetailCustomerSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailCustomerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
