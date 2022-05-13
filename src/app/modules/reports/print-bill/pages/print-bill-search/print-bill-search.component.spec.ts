import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintBillSearchComponent } from './print-bill-search.component';

describe('PrintBillSearchComponent', () => {
  let component: PrintBillSearchComponent;
  let fixture: ComponentFixture<PrintBillSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintBillSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintBillSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
