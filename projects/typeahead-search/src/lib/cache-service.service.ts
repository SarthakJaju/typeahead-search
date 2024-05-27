import { Injectable, OnDestroy } from '@angular/core';
import { SearchAPIConfig, SearchDataModel } from './model/typeahead-search-dropdown-data.model';
import { Observable, catchError, map, of, shareReplay, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TypeaheadSearchService } from './typeahead-search.service';

@Injectable({
  providedIn: 'root'
})
export class CacheServiceService implements OnDestroy {
  $searchStringMap: Map<string, Observable< SearchDataModel[] >> = new Map();
  $resetCacheTimerMap: Map<string, any> = new Map();
  timoutIds: number[] = [];

  constructor(private http: HttpClient, private service: TypeaheadSearchService) { }

  fetchSearchResults( searchString: string, isCacheEnabled: boolean, searchAPI: SearchAPIConfig, searchResponseProcessFn: Function, clearCacheTimer: number ): Observable< SearchDataModel[] > {

    if ( this.isResultCached( searchString ) ) {
      return this.retrieveCachedResults( searchString );
    } 

    // Fetch Search Results using searchAPI
    const $results: Observable< SearchDataModel[] > = this.http.get( this.getUrl( searchAPI, searchString ), searchAPI?.options ).pipe(
      switchMap((response: any) => {
        if ( !this.service.isEmpty( searchResponseProcessFn ) && typeof searchResponseProcessFn === 'function' ) {
          return of(searchResponseProcessFn( response ))
        }
        return of( response )
      }),
      catchError(error => { throw error }),
      shareReplay() 
    ); 

    if ( isCacheEnabled ) {
      this.$searchStringMap.set( searchString, $results.pipe(
        map( results => {
        results?.forEach(x => x.metadata.isCached = true);
        return results;
      })));
      const timeout: number = window.setTimeout(() => { this.$searchStringMap.delete( searchString ) }, clearCacheTimer);
      this.$resetCacheTimerMap.set( searchString, timeout);
      // Saving timer id's so that if service gets destroyed before all the timers are complete then to destroy existing timers
      this.timoutIds.push( timeout );
    }

    return $results;
  }

  getUrl( searchAPI: SearchAPIConfig, searchString: string ): string {
    return `${ searchAPI?.path }?${ searchAPI?.queryParam }=${ searchString }`;
  }

  isResultCached( searchString: string ): boolean {
    return this.$searchStringMap.has( searchString );
  }

  retrieveCachedResults( searchString: string ): Observable< SearchDataModel[] > {
    return this.$searchStringMap.get( searchString );
  }

  ngOnDestroy(): void {
    // Clearing all the timers before service gets destroyed
    this.timoutIds.forEach((timer: number) => clearTimeout( timer ));
  }
}
