# Typeahead-Search
Typeahead-Search `<lib-typeahead-search></lib-typeahead-search>` is a configuration-based real-time prediction library that many search interfaces use to provide suggestions for users as they type in a query. It can behave as both single selection/ multiple-selection (multi-chip) based tool.
The uniqueness and USP of this library is, based on the configuration it can work in both:
- Template-driven Form 
- Reactive Form

 To keep this tool performant and provide a smooth user experience, this tool comes with an inbuilt `cache` that when enabled, will prevent unnecessary process overhead. This library was generated with Angular CLI v16.2.0

Github Repo: [Typeahead-Search](https://github.com/SarthakJaju/typeahead-search)
 
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
| `[(ngModel)]`                 | Accepts Type `SearchDataModel[]` (given below) | [] |  No | when working with template-driven forms, this input property is used to set the data in the Typeahead-Search component and also emits any change in selected results from the Typeahead Component to the host component <br/> Works similar to how `[(ngModel)]` works on an Input Field
| formControlName               | FormControl   |  -              |  No             |   Form-control is required when using this component with Reactive forms. `formControlName` is not an input property for the component, but its a indicator that this component is controlled using reactive form. Please refer Working snippets section
| isDisabled                    | boolean       | false          |  No             |   Disable the SearchBox
| caching                       | boolean       | true           |  No             |   Enable Caching
| highlightError                | boolean       | true           |  No             |   When used with Reactive forms, If the value is not valid then show a red border across the container
| retainResultAfterSelection    | boolean       | false          |  No             |   To keep the results pane open after selecting from the results
| addSearchTextOnEnterkeyPress  | boolean       | false          |  No             | To enable adding search text on the enter keypress
| debounceDuration              | number        | 500            |  No             |  Debounce duration in milli-seconds
| maxSelectionLimit             | number        | null           |  No             |  Provide maximum selections allowed
| clearCacheTimer               | number        | 6000           |  No             |  An entry in cache will be deleted after provided time (in milli-seconds). Time period gets measured from the loading time of the entery
| styleClass                    | string        | null           |  No             |  Style class for the container
| placeholder                   | string        | 'Search'       |  No             |  Placeholder to appear in searchbox
| searchTextValidatorFn            | Function      | null           |  No             | When `addSearchTextOnEnterkeyPress = true` then validate the searched text result against the constraints and add in selected results
| searchResponseProcessFn                 | Function      | null           |  No          | `searchResponseProcessFn` function is conditionally required when the `searchAPI` i.e. Search Results Fetch API does not return result of type `SearchDataModel[]` then to convert API response to `SearchDataModel[]` `searchResponseProcessFn` function is required <br/> This should return data of type `SearchDataModel[]` <br/>
| searchAPI               | Accepts Type <br/>`SearchAPIConfig` (given below) | null |  `yes` | API Configuration to make API calls to fetch prediction/ search results. <br/> Path: Url path, queryParam: Param in API 


### Style Configurations
Below provided style classes/ paths can be used to add more visual effects to this library.

- `.typeahead-search-container` => Style class for search container
- `.typeahead-search-container > .typeahead-search-box` => Style class for search box that includes SelectedItem chips & Input box
- `.typeahead-search-box > ul > li` => Selected Item Chips
- `.typeahead-search-box > input` => Search Input Text Box
- `.lookup-results-container` => Style class for results popup container
- `.lookup-result` => Style class for individual lookup result
- `.lookup-result:hover` => Style class for individual lookup result on hover

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
        queryParam: string,
        options?: object 
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
Note: This will use a GET API Method.
```ts
apiConfig = { 
    path: 'https://dummyjson.com/users/search', 
    queryParam: 'q', 
}
```

### Working snippets (#working-snippets)
1. `<lib-typeahead-search></lib-typeahead-search>` component working in **template driven forms** architecture
    ```html
    <div style="width: 50%;">
        <lib-typeahead-search
            [(ngModel)]="selectedResults" 
            [caching]="true"
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
            [caching]="true"
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