import { TestBed } from '@angular/core/testing';

import { TypeaheadSearchService } from './typeahead-search.service';

describe('TypeaheadSearchService', () => {
  let service: TypeaheadSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeaheadSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
