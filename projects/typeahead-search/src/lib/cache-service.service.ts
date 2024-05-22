import { Injectable } from '@angular/core';
import { SearchDataModel } from './model/typeahead-search-dropdown-data.model';

@Injectable({
  providedIn: 'root'
})
export class CacheServiceService {
   
  searchStringMap: Map<string, SearchDataModel[]> = new Map();

  constructor() { }

  cacheResults( searchString: string, searchResults: SearchDataModel[] ) {
    this.searchStringMap.set( searchString, searchResults );
    console.log( this.searchStringMap );
  }

  isResultCached( searchString: string ): boolean {
    return this.searchStringMap.has( searchString );
  }

  retrieveCachedResults( searchString: string ): SearchDataModel[] {
    return this.searchStringMap.get( searchString );
  }
}
