import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Optional, Output, Self, ViewChild, forwardRef,  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, debounce, distinctUntilChanged, map, takeUntil, timer } from 'rxjs';
import { TypeaheadSearchService } from './typeahead-search.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule } from '@angular/forms';
import { TypeaheadProcessOverlaySpinnerComponent } from './typeahead-process-overlay-spinner/typeahead-process-overlay-spinner.component';
import { SearchDataModel } from './model/typeahead-search-dropdown-data.model';
import { CacheServiceService } from './cache-service.service';

@Component({
  selector: 'lib-typeahead-search',
  standalone: true,
  imports: [CommonModule,  HttpClientModule, FormsModule, TypeaheadProcessOverlaySpinnerComponent, FormsModule, ReactiveFormsModule ],
  templateUrl: './typeahead-search.component.html',
  styleUrls: [ './typeahead-search.component.scss' ],
  providers: [ TypeaheadSearchService, CacheServiceService ],
  changeDetection: ChangeDetectionStrategy.OnPush
  })
export class TypeaheadSearchComponent implements OnInit, OnDestroy, ControlValueAccessor {
  
  searchText: string;
  showProcessOverlay: boolean = false;
  showResultsPopup: boolean = false;
  selectedItems: SearchDataModel[] = [];
  searchResults: SearchDataModel[] = [];
  cacheIconBase64: string = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHiSURBVDiNhZM9a1RBFIafd1gQ/RFJIcEQiCJYLczFa7oVopUgIkYLIxYqieI/EIIfoKAhAbUSJJWkSRXxzqxbKaIEjCLRWG1l4RZ+kNljsbfYXDbmbaaYc54z551zBBBCuA2QZdmNEMIYcAmYAIYBJ2kTWDWzxSzLPtAnlYAlYA/wHbgMfAFemNmGc+6vmY0BJ4D9wEJKaSbP898AtRLUBSaBn8A57/0zSdZfycxuNpvNKTO7X6vVRlut1vF6vf7Llfevy/MrMBljnKMiSV3v/RNJR83syNbW1l0AB9Butx8BV4CP/UkhhLkQwjaY9/6tpKvAdFEU46pWqgCWSnNPVdpRjPEzsOIGZu6i0p9lYMKFEG41m82h/8Tv2wHyCRh2wLWUUr5D0ArQiDHOVO/MzKBn4jdgZBDAe/9U0nUzuxNjPF+BHwA2naSXkk6a2UBDvff3gAtm9qOvujOzSWBVIYSDwDvgTJZlzwdBqgohTAGPU0qHXDnbC8DDoijGd0suiuIw8EDSfJ7naw4gpTQj6b2kIsZ4elA75d+flfRK0ptOpzML5TIBtFqtveV4TgPrkpa73e66c86Z2Si9ZRqRNN/pdGYbjcafbYC+J45LuggcA4boLdwGsJpSWszzfK0//h/BfdVeIIqcXgAAAABJRU5ErkJggg==';
  subscription: Subscription;
  $searchBoxText: Subject<string> = new Subject();
  $unsubscribeInputChange: Subject<any> = new Subject();
  $unsubscribeNotifier: Subject<any> = new Subject();

  @Input() label: string;
  @Input() styleClass: string;
  @Input() debounceDuration: number = 500;
  @Input() highlightError: boolean = true;
  @Input() isDisabled: boolean = false;
  @Input() enableCaching: boolean = true;
  @Input() onEnterValidatorFn: Function;
  @Input() maxSelectionLimit: number;
  @Input() placeholder: string = 'Enter text to search';
  @Input() retainResultAfterSelection: boolean = false;
  @Input({ required: false }) set ngModel( data: SearchDataModel[]) {
    this.selectedItems = this.service.isEmpty(data) ? [] : data;
  };
  @Input({ required: true }) lookupApiConfig: { path: string, queryParam: string };
  @Input({ required: true }) dataProcessFn: Function;
  @Input({ required: true }) allowTypedInEntry: boolean = false;

  @Output() ngModelChange: EventEmitter<SearchDataModel[]> = new EventEmitter();
  @Output() onRecordAdd: EventEmitter<SearchDataModel> = new EventEmitter();
  @Output() onRecordRemove: EventEmitter<SearchDataModel> = new EventEmitter();
  @Output() onError: EventEmitter<string> = new EventEmitter();

  @ViewChild('resultsContainer') resultsContainer: ElementRef;

  public propagateChange: any = () => {};
  public propagateTouched: any = () => {};

  @HostListener('document: click', [ '$event' ])
  listenUserClick(event: Event) {
    if ( !this.resultsContainer?.nativeElement.contains( event?.target ) ) {
      this.showProcessOverlay = false;
      this.showResultsPopup = false;
      this.searchResults = [];
      this.subscription?.unsubscribe();
      this.unsubscribeInputChangeEvent();
    }
  }

  get isInvalid(): boolean {
    return this.typeaheadSearchCtrl ? !this.typeaheadSearchCtrl?.pristine && this.typeaheadSearchCtrl?.invalid : false;
  }

  constructor( private http: HttpClient, 
               private service: TypeaheadSearchService,
               private cacheService: CacheServiceService,
               private cd: ChangeDetectorRef,
               @Self() @Optional() private typeaheadSearchCtrl: NgControl ) {
    if ( this.typeaheadSearchCtrl ) {
      this.typeaheadSearchCtrl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    this.listenInputChange();
  }

  onInputChange() {
    this.$searchBoxText.next( this.searchText );
  }

  private listenInputChange() {
    this.$searchBoxText.asObservable().pipe(
      debounce( () => timer( this.debounceDuration ).pipe( takeUntil(this.$unsubscribeInputChange) ) ),
      takeUntil( this.$unsubscribeNotifier ), 
    ).subscribe( ( searchText: string ) => {
      const isResultFoundInCache: boolean = this.enableCaching && this.cacheService.isResultCached( searchText );
      isResultFoundInCache ? this.retrieveSearchResultsFromCache( searchText ) : this.fetchSearchResults( searchText );
    })
  }

  private retrieveSearchResultsFromCache( searchString: string ) {
    this.subscription?.unsubscribe();
    const searchResults: SearchDataModel[] = this.cacheService.retrieveCachedResults( searchString );
    searchResults?.forEach(result => ( result.metadata.isCached = true ) );
    this.searchResults = searchResults;
    this.showResultsPopup = true;
    this.cd.detectChanges();
  }

  private fetchSearchResults( searchString: string ) {
    this.subscription?.unsubscribe();
    this.showProcessOverlay = true;
    this.cd.detectChanges();
    const url: string = `${ this.lookupApiConfig?.path }?${this.lookupApiConfig?.queryParam}=${searchString}`;
    this.subscription = this.http.get<any>( url ) .subscribe( results => {
      this.searchResults = this.dataProcessFn(results);
      if ( this.enableCaching ) {
        this.cacheService.cacheResults( searchString, this.searchResults );
      }
    }, error => {}, () => {
      this.showProcessOverlay = false;
      this.showResultsPopup = true;
      this.cd.detectChanges();
    });
  } 

  onEnterKeyPress( searchText: string ) {
    if ( !this.allowTypedInEntry || this.service.isEmpty( searchText ) ) { return; };
    function prepareSearchModelData( text: string ): SearchDataModel {
      return { label: text, value: text, metadata: {} };
    }
    if ( typeof this.onEnterValidatorFn === 'function' && this.onEnterValidatorFn ) {
      const isSearchTextValid: boolean = this.onEnterValidatorFn( searchText );
      if ( isSearchTextValid ) {
        this.addSelectedItem( prepareSearchModelData( searchText ), false );
        this.retainResultAfterSelection = false;
        this.unsubscribeInputChangeEvent();
        return;
      }
      this.reportError('Selected text is not valid');
      return;
    }
    // If Select validator function is not passed then, on enter keypress add text in selectedItems list
    this.addSelectedItem( prepareSearchModelData( searchText ), false );
    this.retainResultAfterSelection = false;
    this.unsubscribeInputChangeEvent();
  }

  onBackspacePress( event: any ) {
    const searchString = event?.target?.value;
    if ( this.service.isEmpty( searchString ) ) {
      this.searchResults = [];
      this.unsubscribeInputChangeEvent();
    }
  }

  addSelectedItem(selectedItem: SearchDataModel, retainResultAfterSelection: boolean) { 
    const selectedItemsLength : number = this.selectedItems?.length;
    if ( this.maxSelectionLimit > 0 && this.maxSelectionLimit === selectedItemsLength ) {
      this.reportError('Maximum Selections Reached');
      return;
    }
    this.selectedItems = [ ...this.selectedItems, selectedItem ];
    this.searchText = '';
    this.showResultsPopup = retainResultAfterSelection;
    this.propagateChange( this.selectedItems );
    this.onRecordAdd.emit( selectedItem );
  }

  removeSelectedItem( targetIndex: number ) {
    const removedItem: SearchDataModel = this.selectedItems?.[ targetIndex ];
    this.selectedItems = this.selectedItems?.filter((item, index) => index !== targetIndex );
    this.propagateChange( this.selectedItems );
    this.onRecordRemove.emit( removedItem );
  }

  private unsubscribeInputChangeEvent() {
    this.$unsubscribeInputChange.next(null);
  }

  private reportError( errorMessage: string ) {
    this.onError.emit( errorMessage );
  }

  writeValue(data: SearchDataModel[]): void {
    this.selectedItems = data;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }

  ngOnDestroy(): void {
    this.$unsubscribeNotifier.next(null);
    this.$unsubscribeNotifier.complete();
    this.unsubscribeInputChangeEvent();
    this.$unsubscribeInputChange.complete();
  }
}