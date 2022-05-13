import { TestBed } from '@angular/core/testing';

import { ManualBillingService } from './manual-billing.service';

describe('ManualBillingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ManualBillingService = TestBed.get(ManualBillingService);
    expect(service).toBeTruthy();
  });
});
