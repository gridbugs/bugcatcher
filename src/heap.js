import {arraySwap} from './util.js';

export class Heap {
    constructor(compare) {
        this.compare = compare;
        this.array = new Array();
        this.nextIndex = 1;
    }

    isEmpty() {
        return this.nextIndex == 1;
    }

    get empty() {
        return this.isEmpty();
    }

    getLength() {
        return this.nextIndex - 1;
    }

    get length() {
        return this.getLength();
    }

    insert(x) {
        var index = this.nextIndex;
        ++this.nextIndex;

        this.array[index] = x;

        while (index != 1) {
            let parentIndex = index >> 1;
            if (this.compare(this.array[parentIndex], this.array[index]) < 0) {
                break;
            } else {
                arraySwap(this.array, index, parentIndex);
                index = parentIndex;
            }
        }
    }

    peek() {
        if (this.isEmpty()) {
            throw new Error("Heap is empty");
        }
        return this.array[1];
    }

    pop() {
        if (this.isEmpty()) {
            throw new Error("Heap is empty");
        }
        var ret = this.array[1];

        --this.nextIndex;
        this.array[1] = this.array[this.nextIndex];
        this.array[this.nextIndex] = null;

        var index = 1;
        var maxIndex = this.nextIndex - 1;
        while (true) {
            let leftChildIndex = index << 1;
            let rightChildIndex = leftChildIndex + 1
            let nextIndex;

            if (leftChildIndex < maxIndex) {
                if (this.compare(this.array[leftChildIndex], this.array[rightChildIndex]) < 0) {
                    nextIndex = leftChildIndex;
                } else {
                    nextIndex = rightChildIndex;
                }

                if (this.compare(this.array[nextIndex], this.array[index]) < 0) {
                    arraySwap(this.array, index, nextIndex);
                    index = nextIndex;
                    continue;
                }
            } else if (leftChildIndex == maxIndex && this.compare(this.array[leftChildIndex], this.array[index]) < 0) {
                arraySwap(this.array, index, leftChildIndex);
            }

            break;
        }

        return ret;
    }

    *iterate() {
        for (let i = 1; i != this.nextIndex; ++i) {
            yield this.array[i];
        }
    }
}
