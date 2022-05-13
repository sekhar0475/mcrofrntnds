import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EbillResultComponent } from './ebill-result.component';

describe('EbillResultComponent', () => {
  let component: EbillResultComponent;
  let fixture: ComponentFixture<EbillResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EbillResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EbillResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
