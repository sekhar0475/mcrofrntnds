import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GstrReportsComponent } from './gstr-reports.component';

describe('GstrReportsComponent', () => {
  let component: GstrReportsComponent;
  let fixture: ComponentFixture<GstrReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GstrReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GstrReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
