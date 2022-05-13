import { TestBed } from '@angular/core/testing';

import { InvoiceAnnexureService } from './invoice-annexure.service';

describe('InvoiceAnnexureService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InvoiceAnnexureService = TestBed.get(InvoiceAnnexureService);
    expect(service).toBeTruthy();
  });
});
