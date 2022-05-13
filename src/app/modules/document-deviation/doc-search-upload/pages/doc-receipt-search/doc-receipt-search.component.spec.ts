import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocReceiptSearchComponent } from './doc-receipt-search.component';

describe('DocReceiptSearchComponent', () => {
  let component: DocReceiptSearchComponent;
  let fixture: ComponentFixture<DocReceiptSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocReceiptSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocReceiptSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
