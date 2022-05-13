import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobResultDialogComponent } from './job-result-dialog.component';

describe('JobResultDialogComponent', () => {
  let component: JobResultDialogComponent;
  let fixture: ComponentFixture<JobResultDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobResultDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobResultDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
