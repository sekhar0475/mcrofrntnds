import { TestBed } from '@angular/core/testing';

import { DocumentSearchUploadService } from './document-search-upload.service';

describe('DocumentSearchUploadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DocumentSearchUploadService = TestBed.get(DocumentSearchUploadService);
    expect(service).toBeTruthy();
  });
});
