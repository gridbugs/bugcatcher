import {Directions, DirectionVectors} from './direction.js';
import {tableIterator} from './util.js';

export class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.array = new Array(this.height);
        for (let i = 0; i < this.height; ++i) {
            this.array[i] = new Array(this.width);
        }
    }

    get(x, y) {
        return this.array[y][x];
    }

    set(x, y, value) {
        this.array[y][x] = value;
    }

    getCart(vec) {
        return this.get(vec.x, vec.y);
    }

    setCart(vec, value) {
        this.set(vec.x, vec.y, value);
    }

    get rows() {
        return this.array;
    }

    hasCoordinate(x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }

    hasCoordinateCart(vec) {
        return this.hasCoordinate(vec.x, vec.y);
    }

    *[Symbol.iterator]() {
        for (let row of this.array) {
            for (let x of row) {
                yield x;
            }
        }
    }

    *coordinates() {
        for (let i = 0; i < this.height; ++i) {
            for (let j = 0; j < this.width; ++j) {
                yield [i, j];
            }
        }
    }

    *iterateNeighbours(coordinate) {
        for (let [_, vector] of tableIterator(Directions, DirectionVectors)) {
            var neighbourCoordinate = coordinate.add(vector);
            yield this.getCart(neighbourCoordinate);
        }
    }
}
