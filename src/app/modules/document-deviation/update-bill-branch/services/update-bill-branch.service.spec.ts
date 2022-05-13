import { TestBed } from '@angular/core/testing';

import { UpdateBillBranchService } from './update-bill-branch.service';

describe('UpdateBillBranchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UpdateBillBranchService = TestBed.get(UpdateBillBranchService);
    expect(service).toBeTruthy();
  });
});
