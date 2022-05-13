import { TestBed } from '@angular/core/testing';

import { WaybillWriteOffService } from './waybill-write-off.service';

describe('WaybillWriteOffService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WaybillWriteOffService = TestBed.get(WaybillWriteOffService);
    expect(service).toBeTruthy();
  });
});
