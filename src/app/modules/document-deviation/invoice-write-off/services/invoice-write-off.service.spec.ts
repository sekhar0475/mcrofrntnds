import { TestBed } from '@angular/core/testing';

import { InvoiceWriteOffService } from './invoice-write-off.service';

describe('InvoiceWriteOffService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InvoiceWriteOffService = TestBed.get(InvoiceWriteOffService);
    expect(service).toBeTruthy();
  });
});
