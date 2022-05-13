import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchReceiptComponent } from './search-receipt.component';

describe('SearchReceiptComponent', () => {
  let component: SearchReceiptComponent;
  let fixture: ComponentFixture<SearchReceiptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchReceiptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
