import { TestBed } from '@angular/core/testing';

import { LoteriasService } from './loterias.service';

describe('LoteriasService', () => {
  let service: LoteriasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoteriasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
