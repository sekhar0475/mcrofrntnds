import { TestBed } from '@angular/core/testing';

import { RandomBillingService } from './random-billing.service';

describe('RandomBillingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RandomBillingService = TestBed.get(RandomBillingService);
    expect(service).toBeTruthy();
  });
});
