import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationReasonComponent } from './application-reason.component';

describe('ApplicationReasonComponent', () => {
  let component: ApplicationReasonComponent;
  let fixture: ComponentFixture<ApplicationReasonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationReasonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
