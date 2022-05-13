import { TestBed } from '@angular/core/testing';

import { EinvoiceService } from './einvoice.service';

describe('EinvoiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EinvoiceService = TestBed.get(EinvoiceService);
    expect(service).toBeTruthy();
  });
});
