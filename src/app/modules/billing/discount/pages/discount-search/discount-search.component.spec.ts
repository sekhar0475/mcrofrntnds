import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountSearchComponent } from './discount-search.component';

describe('DiscountSearchComponent', () => {
  let component: DiscountSearchComponent;
  let fixture: ComponentFixture<DiscountSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscountSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
