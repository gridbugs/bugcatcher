import {DirectionVectors} from './direction.js';
import {tableIterator} from './util.js';

export class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.array = new Array(this.height);
        for (let i = 0; i < this.height; ++i) {
            this.array[i] = new Array(this.width);
        }
        this.tmpArray = [0, 0];
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
        for (let i = 0; i < this.height; ++i) {
            for (let j = 0; j < this.width; ++j) {
                yield this.array[i][j];
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

    *iterateNeighbourCoordinates(coordinate, vectors=DirectionVectors) {
        for (let vector of vectors) {
            var neighbourCoordinate = coordinate.add(vector);
            if (this.hasCoordinateCart(neighbourCoordinate)) {
                yield neighbourCoordinate;
            }
        }
    }

    *iterateNeighbours(coordinate, vectors=DirectionVectors) {
        for (let vector of this.iterateNeighbourCoordinates(coordinate, vectors)) {
            yield this.getCart(vector);
        }
    }

    *iterateNeighbourPairs(coordinate, directions) {
        for (let direction of directions) {
            let vector = DirectionVectors[direction];
            let neighbourCoordinate = coordinate.add(vector);
            if (this.hasCoordinateCart(neighbourCoordinate)) {
                this.tmpArray[0] = direction;
                this.tmpArray[1] = neighbourCoordinate;
                yield this.tmpArray;
            }
        }
    }
}
