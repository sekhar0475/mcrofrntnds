import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EbillSearchComponent } from './ebill-search.component';

describe('EbillSearchComponent', () => {
  let component: EbillSearchComponent;
  let fixture: ComponentFixture<EbillSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EbillSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EbillSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
