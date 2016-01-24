export class BestTracker {
    constructor(compare) {
        this.compare = compare;
        this.best = null;
        this.length = 0;
    }

    clear() {
        this.best = null;
        this.length = 0;
    }

    get empty() {
        return this.length == 0;
    }

    insert(x) {
        if (this.length == 0 || this.compare(x, this.best) > 0) {
            this.best = x;
        }
        ++this.length;
    }

    get() {
        if (this.length != 0) {
            return this.best;
        }
        throw new Error();
    }
}
