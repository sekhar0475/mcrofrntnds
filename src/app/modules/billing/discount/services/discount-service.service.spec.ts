import { TestBed } from '@angular/core/testing';

import { DiscountServiceService } from './discount-service.service';

describe('DiscountServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DiscountServiceService = TestBed.get(DiscountServiceService);
    expect(service).toBeTruthy();
  });
});
