import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchAutoHoldBillComponent } from './search-auto-hold-bill.component';

describe('SearchAutoHoldBillComponent', () => {
  let component: SearchAutoHoldBillComponent;
  let fixture: ComponentFixture<SearchAutoHoldBillComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchAutoHoldBillComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchAutoHoldBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
