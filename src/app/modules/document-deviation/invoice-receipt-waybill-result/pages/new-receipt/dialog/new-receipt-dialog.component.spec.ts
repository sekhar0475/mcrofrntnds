import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NewReceiptDialogComponent } from './new-receipt-dialog.component';

describe('NewReceiptDialogComponent', () => {
  let component: NewReceiptDialogComponent;
  let fixture: ComponentFixture<NewReceiptDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NewReceiptDialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewReceiptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
