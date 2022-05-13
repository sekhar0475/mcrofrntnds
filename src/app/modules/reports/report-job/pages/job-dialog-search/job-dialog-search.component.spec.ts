import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDialogSearchComponent } from './job-dialog-search.component';

describe('JobDialogSearchComponent', () => {
  let component: JobDialogSearchComponent;
  let fixture: ComponentFixture<JobDialogSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobDialogSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDialogSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
