import { TestBed } from '@angular/core/testing';

import { ReceiptWriteoffService } from './receipt-writeoff.service';

describe('ReceiptWriteoffServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReceiptWriteoffService = TestBed.get(ReceiptWriteoffService);
    expect(service).toBeTruthy();
  });
});
