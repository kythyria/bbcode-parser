import { Position, last } from './util';
import { Token } from './tokeniser';
import { DtdElement } from './schema';

export enum NodeType {
    Document,
    Element,
    Text,
}

export class Node {
    type: NodeType;
    children: Node[];
    parent: Node | null;

    constructor(type: NodeType) {
        this.type = type;
        this.children = [];
        this.parent = null;
    }

    appendChild(child: Node) {
        child.parent = this;
        this.children.push(child);
    }

    get lastChild() : Node | null {
        return last(this.children);
    }

    get start() : Position | null {
        if(this.children.length == 0) { return null; }

        return this.children[0].start;
    }

    get end() : Position | null {
        let c = last(this.children);
        return c ? c.end : null;
    }
}

export class Element extends Node {
    schemaItem: DtdElement;
    startTag: Token;
    endTag?: Token;
    attribute?: string;

    constructor(schemaItem : DtdElement, startTag: Token, attribute?: string) {
        super(NodeType.Element);
        this.schemaItem = schemaItem;
        this.startTag = startTag;
        this.attribute = attribute;
    }

    get start() : Position {
        return this.startTag.start;
    }

    get end() : Position {
        if (this.endTag) {
            return this.endTag.end;
        }
        else {
            let c = last(this.children);
            if(c && c.end) {
                return c.end;
            }
            else {
                return this.startTag.end;
            }
        }
    }
}

export class Text extends Node {
    _start? : Position;
    _end? : Position;

    data: string = "";

    constructor(token?: Token) {
        super(NodeType.Text);

        if(token) {
            this._start = token.start;
            this._end = token.end;
            this.data = token.fullText;
        }
    }

    get start() : Position | null {
        return this._start || null;
    }
    get end() : Position | null{
        return this._end || null
    }
    
    appendToken(tok: Token) {
        if(tok.start.neq(this._end)) {
            throw new Error("Tried to append a disjoint token.");
        }
        else {
            this._end = tok.end;
            this.data += tok.fullText;
        }
    }

}