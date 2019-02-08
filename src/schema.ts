// "cdata" : Things which aren't tags (urls, emotes, text)
// "pcdata" : PLain text only, even if it's a tag.
// "any" : anything
// "empty" : not even a closing tag (eg, [hr])
export type Content = ("cdata" | "pcdata" | "any" | "empty" | DtdElement)[];

export interface DtdElement {
    // name used in bbcode
    tagname : string;
    
    // What can appear inside the element
    contentModel : Content;

    // If true, [foo][foo] is read like [foo][/foo][foo].
    isDelimiter: boolean;

    // If true, the attribute MUST be present. If false, MUST NOT.
    // If "optional", is OPTIONAL (eg, [url])
    hasAttribute : boolean | "optional";

    // If you're using React for the "to HTML" step, this is a good place
    // to put the component to use. `any` because the actual signature
    // would require an otherwise unnecessary React dependency.
    component : any;
}