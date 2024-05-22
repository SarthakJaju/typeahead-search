import { provideHttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TypeaheadSearchService {

  $search: BehaviorSubject<string> = new BehaviorSubject('');

  constructor( private HttpClient: HttpClient ) { }

  isEmpty(value: string | number | boolean | object | Function ): boolean {
    if ( value === '' || value === null || value === undefined ) {
        return true;
    }

    // Note: In this step, sequence is important
    // Checking for empty array is done before checking for object as typeof [] === object 
    if ( Array.isArray( value ) && value?.length === 0 ) {
        return true;
    }
    
    if ( typeof value === 'object' && Object.keys(value)?.length === 0 ) {
        return true;
    }

    return false;
  }

  setSearchString( searchText: string ) {
    this.$search.next( searchText );
  }

  listenSearchTextChange(): Observable<string> {
    return this.$search.asObservable();
  }
}
