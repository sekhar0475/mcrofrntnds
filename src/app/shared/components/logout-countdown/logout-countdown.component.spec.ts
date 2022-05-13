import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutCountdownComponent } from './logout-countdown.component';

describe('LogoutCountdownComponent', () => {
  let component: LogoutCountdownComponent;
  let fixture: ComponentFixture<LogoutCountdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogoutCountdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoutCountdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
