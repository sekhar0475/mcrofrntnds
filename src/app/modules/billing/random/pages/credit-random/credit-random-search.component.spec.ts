import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditRandomSearchComponent } from './credit-random-search.component';

describe('CreditRandomSearchComponent', () => {
  let component: CreditRandomSearchComponent;
  let fixture: ComponentFixture<CreditRandomSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditRandomSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditRandomSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
