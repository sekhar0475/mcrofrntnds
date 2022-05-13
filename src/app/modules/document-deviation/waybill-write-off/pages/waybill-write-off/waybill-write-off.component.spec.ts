import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaybillWriteOffComponent } from './waybill-write-off.component';

describe('WaybillWriteOffComponent', () => {
  let component: WaybillWriteOffComponent;
  let fixture: ComponentFixture<WaybillWriteOffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaybillWriteOffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaybillWriteOffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
