export interface SearchDataModel {
    label: string;
    value: string | number;
    metadata: {
        isCached?: boolean;
        [key: string]: any
    }
}