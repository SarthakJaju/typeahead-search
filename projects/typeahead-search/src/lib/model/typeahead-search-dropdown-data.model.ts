import { HttpHeaders } from "@angular/common/http";

export interface SearchDataModel {
    label: string;
    value: string | number;
    metadata: {
        isCached?: boolean;
        [key: string]: any
    }
}

export interface SearchAPIConfig { 
    path: string, 
    queryParam: string,
    options?: object
}