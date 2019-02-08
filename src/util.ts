export class Position {
    line: number;
    column: number;

    constructor(line: number, column: number) {
        this.line = line;
        this.column = column;
    }

    eq(x? : Position, y? : Position) : boolean {
        if (!x) {
            return false;
        }
        if (!y) {
            return this.eq(this, x);
        }
        else {
            return x.line == y.line && x.column == y.column;
        }
    }

    gt(x?: Position, y? : Position) : boolean {
        if (!x) {
            return false;
        }
        if (!y) {
            return this.gt(this, x);
        }
        else {
            return x.line > y.line || (x.line == y.line && x.column > y.column);
        }
    }

    lt(x?: Position, y? : Position) : boolean {
        if (!x) {
            return false;
        }
        if (!y) {
            return this.lt(this, x);
        }
        else {
            return x.line < y.line || (x.line == y.line && x.column < y.column);
        }
    }

    neq(x?: Position, y? : Position) : boolean {
        return !this.eq(x,y);
    }
}

export function last<T>(ary : T[]) {
    if(ary.length == 0) {
        return null;
    }
    return ary[ary.length-1];
}

export function* zip<T>(...lists : Iterable<T>[]) : IterableIterator<T[]> {
    let iters = lists.map(i => i[Symbol.iterator]());
    while(true) {
        let curr = iters.map(i => i.next());
        let alldone = curr.reduce((a,v) => a && v.done, false);
        if(alldone) { return; }
        yield curr.map(i => i.value);
    }
}