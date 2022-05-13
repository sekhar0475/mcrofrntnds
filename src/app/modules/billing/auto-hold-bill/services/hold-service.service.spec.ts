import { TestBed } from '@angular/core/testing';

import { HoldServiceService } from './hold-service.service';

describe('HoldServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HoldServiceService = TestBed.get(HoldServiceService);
    expect(service).toBeTruthy();
  });
});
