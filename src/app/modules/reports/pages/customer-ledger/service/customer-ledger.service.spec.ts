import { TestBed } from '@angular/core/testing';

import { CustomerLedgerService } from './customer-ledger.service';

describe('CustomerLedgerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CustomerLedgerService = TestBed.get(CustomerLedgerService);
    expect(service).toBeTruthy();
  });
});
