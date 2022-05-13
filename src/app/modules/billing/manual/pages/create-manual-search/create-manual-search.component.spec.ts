import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateManualSearchComponent } from './create-manual-search.component';

describe('CreateManualSearchComponent', () => {
  let component: CreateManualSearchComponent;
  let fixture: ComponentFixture<CreateManualSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateManualSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateManualSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
