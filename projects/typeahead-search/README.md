# Typeahead-Search
Typeahead-Search `<lib-typeahead-search></lib-typeahead-search>` is a configuration-based real-time prediction library that many search interfaces use to provide suggestions for users as they type in a query. It can behave as both single selection/ multiple-selection (multi-chip) based tool.
The uniqueness and USP of this library is, based on the configuration it can work in both:
- Template-driven Form 
- Reactive Form

 To keep this tool performant and provide a smooth user experience, this tool comes with an inbuilt `cache` that when enabled, will prevent unnecessary process overhead. This library was generated with Angular CLI v16.2.0
 
## Configuration Instructions
- npm i typeahead-search
- import { TypeaheadSearchComponent } from 'typeahead-search'
- Add `TypeaheadSearchComponent` in imports array of module/ standalone component. 
- Put `<lib-typeahead-search></lib-typeahead-search>` in host component's template
- Define configuration based on the input/ output properties as defined below
That's it, now save the changes and enjoy using this awesome library!

## Features
- In-built `Cache` (If enabled)
- Can work with both Template-driven forms i.e. `[(ngModel)]` and Reactive Forms
- Uses debounce strategy to minimize API calls to fetch search results
- It can also work as a Type & Enter strategy to add typed-in text to selected results, If provided with a validator function then it will
validate before adding the result
- Accepts an API configuration to fetch search results
- Timely unsubscription of API calls, thus avoiding memory leaks. 
- Emits the required events like: `onRecordAdd` `onRecordRemove` `onError` for the host application to consume
- Uses Angular's OnPush Change Detection Strategy, thus the changes will reflect when the references are changed for input properties
- Styles are designed as such, they are easily configurable


## Configuration Properties
| Property                      | Type          | Default Value  | Required        | Description
| ---------                     | -------       | -------------  |  -------        | -----------
| isDisabled                    | boolean       | false          |  No             |   Disable the SearchBox
| caching                       | boolean       | true           |  No             |   Enable Caching
| highlightError                | boolean       | true           |  No             |   When used with Reactive forms, If the value is not valid then show a red border across the container
| retainResultAfterSelection    | boolean       | false          |  No             |   To keep the results pane open after selecting from the results
| addSearchTextOnEnterkeyPress  | boolean       | false          |  `Yes`          | To enable adding search text on the enter keypress
| debounceDuration              | number        | 500ms          |  No             |  Debounce duration
| maxSelectionLimit             | number        | null           |  No             |  Provide maximum selections allowed
| styleClass                    | string        | null           |  No             |  Style class for the container
| placeholder                   | string        | 'Enter text to search' |  No     |  Placeholder to appear in searchbox
| searchTextValidatorFn            | Function      | null           |  No             | When `addSearchTextOnEnterkeyPress = true` then validate the searched text result against the constraints and add in selected results
| searchResponseProcessFn                 | Function      | null           |  `yes`          | Function to process obtained results from the provided API configuration before display in results popup. <br/> This should return data of type `SearchDataModel[]`
| searchAPI               | Accepts Type <br/>`SearchAPIConfig` (given below) | null |  `yes` | API Configuration to make API calls to fetch prediction/ search results. <br/> Path: Url path, queryParam: Param in API 
| `[(ngModel)]`                 | Accepts Type `SearchDataModel[]` (given below) | [] |  No | when working with template-driven forms, this input property is used to set the data in the Typeahead-Search component and also emits any change in selected results from the Typeahead Component to the host component <br/> Works similar to how `[(ngModel)]` works on an Input Field

### Data Interfaces
The interfaces defined in the library could well be imported and used in the host application component

1.  import { SearchAPIConfig } from 'typeahead-search/lib/model/typeahead-search-dropdown-data.model';
    ```ts
    interface SearchDataModel {
        label: string;
        value: string | number;
        metadata?: {
            [key: string]: any
        }
    }
    ```
2.  import { SearchDataModel } from 'typeahead-search/lib/model/typeahead-search-dropdown-data.model';
    ```ts
    interface SearchAPIConfig { 
        path: string, 
        queryParam: string 
    }
    ```

### Example Functions
The functions listed below should give an idea about how the functions that are passed to the library component should be configured.
1.  `searchResponseProcessFn()` will accept the response and return the response in `SearchDataModel[]` type <br/>
    Example:

    ```ts
    searchResponseProcessFn = ( response: any ): SearchDataModel[] => {
      response = response['users'];
      return response?.map((result: any) => {
        const label: string = `${result?.firstName} ${result?.lastName}`;
        const value = result?.username;
        return { label, value, metadata: {} };
      });
    }
    ```
2.  `searchTextValidatorFn()` will be used to validate the searchText on enter keypress (if `addSearchTextOnEnterkeyPress = true`) <br/> 
    Example:

    ```ts
    searchTextValidatorFn = ( searchText: string ): boolean => searchText?.length > 2;
    ``` 

### API Configuration
The API path and query params can be passed to the typeahead-search component, which will be used to fetch the search results from the target API, this will form API :  `https://dummyjson.com/users/search?q=searchText`
```ts
apiConfig = { 
    path: 'https://dummyjson.com/users/search', 
    queryParam: 'q' 
}
```

### Working snippets
1. `<lib-typeahead-search></lib-typeahead-search>` component working in **template driven forms** architecture
    ```html
    <div style="width: 50%;">
        <lib-typeahead-search
            [(ngModel)]="selectedResults" 
            [caching ]="true"
            [highlightError]="true"
            [retainResultAfterSelection]="false"
            [addSearchTextOnEnterkeyPress]="true"
            placeholder="Search"
            [debounceDuration]="500"
            [searchAPI]="apiConfig"
            [searchResponseProcessFn]="dataProcessFn"
            [searchTextValidatorFn]="entryTextValidatorFn"
            (onError)=onError($event)>
        </lib-typeahead-search>
    </div>
    ```

2. `<lib-typeahead-search></lib-typeahead-search>` component working in **Reactive forms** architecture
    ```html
    <form [formGroup]="searchForm" style="width: 50%;">
        <lib-typeahead-search
            formControlName="lookaheadSearch" 
            [caching ]="true"
            [highlightError]="true"
            [retainResultAfterSelection]="false"
            [addSearchTextOnEnterkeyPress]="true"
            placeholder="Search"
            [debounceDuration]="500"
            [searchAPI]="apiConfig"
            [searchResponseProcessFn]="dataProcessFn"
            [searchTextValidatorFn]="entryTextValidatorFn"
            (onError)=onError($event)>
        </lib-typeahead-search>
    </form>
    ```
    `searchForm` will look something like this: <br/>
    ```ts
        searchForm = this.fb.group({ lookaheadSearch: [[], Validators.required] });
    ```

    **lookaheadSearch** form-control will hold the value of type `SearchDataModel[]`