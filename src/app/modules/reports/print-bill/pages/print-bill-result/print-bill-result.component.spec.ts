import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintBillResultComponent } from './print-bill-result.component';

describe('PrintBillResultComponent', () => {
  let component: PrintBillResultComponent;
  let fixture: ComponentFixture<PrintBillResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintBillResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintBillResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
