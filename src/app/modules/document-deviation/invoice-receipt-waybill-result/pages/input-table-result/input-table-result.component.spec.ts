import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTableResultComponent } from './input-table-result.component';

describe('InputTableResultComponent', () => {
  let component: InputTableResultComponent;
  let fixture: ComponentFixture<InputTableResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputTableResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputTableResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
