import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendPopupComponent } from './resend-popup.component';

describe('ResendPopupComponent', () => {
  let component: ResendPopupComponent;
  let fixture: ComponentFixture<ResendPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResendPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResendPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
