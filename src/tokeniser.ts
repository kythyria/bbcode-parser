import { Position } from './util';

export enum Type {
    OpenTag,
    CloseTag,
    Linebreak,
    Url,
    Emote,
    Text,
    Eof
}

export class Token {
    type : Type;
    start: Position;
    end: Position;
    fullText : string;

    constructor(type : Type, start: Position, end: Position, fullText: string) {
        this.type = type;
        this.start = start;
        this.end = end;
        this.fullText = fullText;
    }
}

export class TagToken extends Token {
    name : string;
    attribute? : string;

    constructor(type : Type, start: Position, end: Position, fullText: string, name : string, attribute? : string) {
        super(type, start, end, fullText)
        this.name = name;
        this.attribute = attribute;
    }
}

export class EmoteToken extends Token {
    data : string;
    constructor(type : Type, start: Position, end: Position, fullText: string, data : string) {
        super(type, start, end, fullText)
        this.data = data;
    }
}

class StringScanner {
    input : string;
    index: number;
    line: number;
    column: number;

    public constructor(str : string) {
        this.input = str;
        this.index = 0;
        this.line = 0;
        this.column = 0;
    }

    // Beware, this function mutates its argument.
    // Blame the lack of a real Match object.
    // re SHOULD be sticky (the y flag).
    public match(re : RegExp) : RegExpExecArray | null {
        re.lastIndex = this.index;
        let m = re.exec(this.input);
        if(m != null) {
            this.updatePosition(re.lastIndex);
        }
        return m;
    }

    public scanToDelimiter(delim : string) : string | null {
        let idx = this.input.indexOf(delim, this.index);
        let result : string;
        if(idx == -1) {
            return null;
        }
        else {
            result = this.input.slice(this.index, idx);
            this.updatePosition(idx + delim.length);
        }
        this
        return result;
    }

    public get atEnd() : boolean {
        return this.index >= this.input.length;
    }

    private updatePosition(newpos: number) : void {
        for(; this.index < newpos; this.index++)
        while(this.index != newpos) {
            this.column++;
            if(this.input[this.index] == "\n") {
                this.line++;
                this.column = 0;
            }
        }
    }

    public get position() : Position {
        return new Position(this.line, this.column);
    }
}

export function* tokenise(input : string) : IterableIterator<Token> {
    let OPENTAG   = /^\[([\*_a-zA-Z][-_\.0-9A-Za-z]*)(?:=(?:"([^"])*?"|'([^'])*?'|([^\]]*?)))?\]/y;
    let CLOSETAG  = /^\[\/([\*_a-zA-Z][-_\.0-9A-Za-z]*)\]/y;
    let LINEBREAK = /^\r?\n/y;
    let EMOTE     = /^:([_a-zA-Z][-_\.0-9A-Za-z]*):/y;
    let TEXT      = /^(?:\.|[^\[\r\n:]+)/y 

    let scanner = new StringScanner(input);
    while(!scanner.atEnd) {
        let m : RegExpExecArray | null;
        let p = scanner.position;
        if(m = scanner.match(OPENTAG)) {
            yield new TagToken(Type.OpenTag, p, scanner.position, m[0], m[1], m[2] || m[3] || m[4]);
        }
        else if(m = scanner.match(CLOSETAG)) {
            yield new TagToken(Type.CloseTag, p, scanner.position, m[0], m[1]);
        }
        if(m = scanner.match(EMOTE)) {
            yield new EmoteToken(Type.Emote, p, scanner.position, m[0], m[1]);
        }
        else if(m = scanner.match(LINEBREAK)) {
            yield new Token(Type.Linebreak, p, scanner.position, m[0]);
        }
        else if(m = scanner.match(TEXT)) {
            yield new Token(Type.Text, p, scanner.position, m[0]);
        }
    }
}