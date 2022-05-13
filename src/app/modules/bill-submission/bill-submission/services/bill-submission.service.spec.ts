import { TestBed } from '@angular/core/testing';

import { BillSubmissionService } from './bill-submission.service';

describe('BillSubmissionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BillSubmissionService = TestBed.get(BillSubmissionService);
    expect(service).toBeTruthy();
  });
});
