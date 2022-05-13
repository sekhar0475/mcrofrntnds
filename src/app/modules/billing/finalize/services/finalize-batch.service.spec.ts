import { TestBed } from '@angular/core/testing';

import { FinalizeBatchService } from './finalize-batch.service';

describe('FinalizeBatchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FinalizeBatchService = TestBed.get(FinalizeBatchService);
    expect(service).toBeTruthy();
  });
});
