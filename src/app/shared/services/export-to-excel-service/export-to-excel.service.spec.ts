import { TestBed } from '@angular/core/testing';

import { ExportToExcelService } from './export-to-excel.service';

describe('ExportToExcelService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ExportToExcelService = TestBed.get(ExportToExcelService);
    expect(service).toBeTruthy();
  });
});
