import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateManualBatchComponent } from './create-manual-batch.component';

describe('CreateManualBatchComponent', () => {
  let component: CreateManualBatchComponent;
  let fixture: ComponentFixture<CreateManualBatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateManualBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateManualBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
