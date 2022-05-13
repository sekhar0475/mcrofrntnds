import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceiptSearchComponent } from './receipt-search.component';



describe('SearchComponent', () => {
  let component: ReceiptSearchComponent;
  let fixture: ComponentFixture<ReceiptSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiptSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
