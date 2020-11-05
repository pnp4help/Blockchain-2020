import { TestBed } from '@angular/core/testing';

import { CompServiceService } from './comp-service.service';

describe('CompServiceService', () => {
  let service: CompServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
