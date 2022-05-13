import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoBillHoldComponent } from './auto-bill-hold.component';

describe('AutoBillHoldComponent', () => {
  let component: AutoBillHoldComponent;
  let fixture: ComponentFixture<AutoBillHoldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoBillHoldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoBillHoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
