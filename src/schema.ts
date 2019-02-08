export type Content = "cdata" | "pcdata" | "any" | "empty" | DtdElement[];

export interface DtdElement {
    tagname : string;
    contentModel : Content;
    isDelimiter: boolean;
    hasAttribute : boolean | "optional";
    component : string;
}