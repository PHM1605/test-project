function Range(from, to) {
    this.from = from;
    this.to = to;
}

Range.prototype = {
    includes: function(x) {return this.from <=x && x<=this.to;},
    [Symbol.iterator]: function* () {
        for(let x=this.from; x<=this.to; x++) {
            yield x;
        }
    },
    toString: function() {
        return "(" + this.from + "..." + this.to + ")";
    }
}

function Span(start, span) {
    if(span >= 0) {
        this.from = start;
        this.to = start + span;
    } else {
        this.to = start; 
        this.from = start + span;
    }
}

Span.prototype = Object.create(Range.prototype);
Span.prototype.constructor = Range;
let test = new Span(3,5);
console.log(test.toString());
Span.prototype.toString = function() {
    return `${this.from}.....+${this.to - this.from}`;
}
console.log(test.toString());