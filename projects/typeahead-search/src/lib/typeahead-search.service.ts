import { provideHttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TypeaheadSearchService {

  isEmpty(value: string | number | boolean | object | Function ): boolean {
    if ( value === '' || value === null || value === undefined ) {
        return true;
    }
    
    if ( Array.isArray( value ) && value?.length === 0 ) {
        return true;
    }
    
    if ( typeof value === 'object' && Object.keys(value)?.length === 0 ) {
        return true;
    }

    return false;
  }
}
