import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditRandomResultComponent } from './credit-random-result.component';

describe('CreditRandomResultComponent', () => {
  let component: CreditRandomResultComponent;
  let fixture: ComponentFixture<CreditRandomResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditRandomResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditRandomResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
