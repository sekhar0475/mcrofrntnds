import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBillSubmissionComponent } from './search-bill-submission.component';

describe('SearchBillSubmissionComponent', () => {
  let component: SearchBillSubmissionComponent;
  let fixture: ComponentFixture<SearchBillSubmissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchBillSubmissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBillSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
