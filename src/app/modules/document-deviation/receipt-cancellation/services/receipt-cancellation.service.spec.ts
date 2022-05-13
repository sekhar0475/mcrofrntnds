import { TestBed } from '@angular/core/testing';

import { ReceiptCancellationService } from './receipt-cancellation.service';

describe('ReceiptCancellationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReceiptCancellationService = TestBed.get(ReceiptCancellationService);
    expect(service).toBeTruthy();
  });
});
