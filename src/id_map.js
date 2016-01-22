export class IdMap {
    constructor(Type) {
        this.array = [];
        this.size = 0;
        this.arrayKeys = new Set();
        this.tmpArray = [null, null];
        if (Type != null) {
            this.table = Type.table;
        }
    }
    initializeAsSet(elements) {
        for (let e of elements) {
            this.add(e);
        }
        return this;
    }
    clear() {
        for (let key of this.keys()) {
            this.delete(key);
        }
    }
    delete(obj) {
        delete this.array[obj.id];
        this.arrayKeys.delete(obj.id);
    }
    *keys() {
        for (let i of this.arrayKeys) {
            yield this.table[i];
        }
    }
    *entries() {
        for (let i of this.arrayKeys) {
            this.tmpArray[0] = this.table[i];
            this.tmpArray[1] = this.array[i];
            yield this.tmpArray;
        }
    }
    *values() {
        for (let i of this.arrayKeys) {
            yield this.array[i];
        }
    }
    *[Symbol.iterator]() {
        yield* this.entries();
    }
    get(obj) {
        return this.array[obj.id];
    }
    set(obj, value) {
        if (obj.id == undefined) {
            console.debug(obj);
            throw new Error();
        }
        this.array[obj.id] = value;
        this.arrayKeys.add(obj.id);
    }
    add(obj) {
        this.set(obj, obj);
    }
}
