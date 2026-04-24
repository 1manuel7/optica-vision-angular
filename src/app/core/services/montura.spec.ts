import { TestBed } from '@angular/core/testing';
import { MonturaService } from './montura';

describe('MonturaService', () => {
  let service: MonturaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonturaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});