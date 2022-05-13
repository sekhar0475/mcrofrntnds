import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnapplicationComponent } from './unapplication.component';

describe('UnapplicationComponent', () => {
  let component: UnapplicationComponent;
  let fixture: ComponentFixture<UnapplicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnapplicationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnapplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
