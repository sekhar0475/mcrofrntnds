import { TestBed } from '@angular/core/testing';

import { AlliedBillingService } from './allied-billing.service';

describe('AlliedBillingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AlliedBillingService = TestBed.get(AlliedBillingService);
    expect(service).toBeTruthy();
  });
});
