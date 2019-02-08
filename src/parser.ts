import * as Tokeniser from './tokeniser'; 
import { last } from './util';
import { DtdElement } from './schema';
import * as BbDom from './bbdom';

interface Warning {
    offendingToken : Tokeniser.Token;
    message: string;
}

interface ParseResult {
    result: BbDom.Node;
    warnings: Warning[];
}

export function parse(input : string, schema: { [index:string] : DtdElement}) : ParseResult {
    let tokenstream = Tokeniser.tokenise(input);

    let document = new BbDom.Node(BbDom.NodeType.Document);
    let curr = document;
    let warnings : Warning[] = [];

    let addText = (tok : Tokeniser.Token) => {
        if(!(curr.lastChild instanceof BbDom.Text)) {
            curr.appendChild(new BbDom.Text(tok));
        }
        else {
            curr.lastChild.appendToken(tok);
        }
    };

    for (const i of tokenstream) {
        let tagNames : string[] = [];

        if(i instanceof Tokeniser.TagToken && i.type == Tokeniser.Type.OpenTag) {
            let contentmodel = (<BbDom.Element>curr).schemaItem.contentModel;

            if (contentmodel == "cdata" || contentmodel == "pcdata") {
                addText(i);
                break;
            }

            let tn = i.name.toLowerCase();
            let si = schema[tn];

            if(!si) {
                warnings.push({offendingToken: i, message: "Tag invoked which is not an element at all"});
                addText(i);
            }
            else if (contentmodel == "empty") {
                let el = new BbDom.Element(si, i, i.attribute);
                curr.appendChild(el);
            }
            else if (contentmodel == "any") {
                let el = new BbDom.Element(si, i, i.attribute);
                curr.appendChild(el);
                tagNames.push(i.name.toLowerCase());
                curr = el;
            }
            else if (contentmodel instanceof Array) {
                if (contentmodel.indexOf(si) != -1) {
                    let el = new BbDom.Element(si, i, i.attribute);
                    curr.appendChild(el);
                    tagNames.push(i.name.toLowerCase());
                    curr = el;
                }
                else {
                    warnings.push({offendingToken: i, message: "Element not permitted here by schema"});
                    addText(i);
                }
            }
        }
        else if(i instanceof Tokeniser.TagToken && i.type == Tokeniser.Type.CloseTag) {
            if(last(tagNames) == i.name.toLowerCase()) {
                (<BbDom.Element>curr).endTag = i;
                curr = curr.parent || curr;
                tagNames.pop();
            }
            else {
                let cm = (<BbDom.Element>curr).schemaItem.contentModel;
                if (cm == "cdata" || cm == "pcdata") {
                    addText(i);
                }
                else if(tagNames.length == 0) {
                    warnings.push({offendingToken: i, message: "Tried to close an element with none open"});
                    addText(i);
                }
                else if(tagNames.lastIndexOf(i.name.toLowerCase()) != -1) {
                    warnings.push({offendingToken: i, message: `Tried to close a parent element before the child (expected ${last(tagNames)})`});
                    while(true) {
                        if(last(tagNames) == i.name.toLowerCase()) {
                            (<BbDom.Element>curr).endTag = i;
                            curr = curr.parent || curr;
                            tagNames.pop();
                            break;
                        }
                        else {
                            curr = curr.parent || curr;
                            tagNames.pop();
                        }
                    }
                }
                else {
                    warnings.push({offendingToken: i, message: "Tried to close an element that wasn't open"});
                    addText(i);
                }
            }
        }
        else if (i instanceof Tokeniser.EmoteToken) {
            curr.appendChild(new BbDom.Element(schema["__emote"], i, i.fullText));
        }
        else if(i.type == Tokeniser.Type.Linebreak) {
            curr.appendChild(new BbDom.Element(schema["__br"], i));
        }
        else if(i.type == Tokeniser.Type.Url) {
            curr.appendChild(new BbDom.Element(schema["__url"], i, i.fullText));
        }
        else {
            addText(i);
        };
    }
    return { warnings: warnings, result: document };
}