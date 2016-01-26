import {DirectionVectors, CardinalDirectionVectors} from './direction.js';
import {tableIterator, generateNonNull} from './util.js';
import {Vec2} from './vec2.js';

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.coordinates = new Vec2(x ,y);
        this.value = null;
    }

    initializeNeighbours(grid) {
        this.grid = grid;
        this._cardinalNeighbourCoordinates = new Array(4);
        this._cardinalNeighbours = new Array(4);
        for (let i = 0; i < CardinalDirectionVectors.length; ++i) {
            let neighbourCoordinates = this.coordinates.add(CardinalDirectionVectors[i]);
            if (grid.hasCoord(neighbourCoordinates)) {
                this._cardinalNeighbourCoordinates[i] = neighbourCoordinates;
                this._cardinalNeighbours[i] = grid.getCell(neighbourCoordinates);
            }
        }
    }

    *cardinalNeighbours() {
        yield* generateNonNull(this._cardinalNeighbours);
    }

    *cardinalNeighboursWithDirection() {
        for (let i = 0; i < CardinalDirectionVectors.length; ++i) {
            if (this._cardinalNeighbours[i] != undefined) {
                yield [this._cardinalNeighbours[i], i];
            }
        }
    }

    getCardinalNeighbour(direction) {
        return this._cardinalNeighbours[direction];
    }
}

export class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.array = new Array(this.height);
        for (let i = 0; i < this.height; ++i) {
            this.array[i] = new Array(this.width);
            for (let j = 0; j < this.width; ++j) {
                this.array[i][j] = new Cell(j, i);
            }
        }
        for (let i = 0; i < this.height; ++i) {
            for (let j = 0; j < this.width; ++j) {
                this.array[i][j].initializeNeighbours(this);
            }
        }

        this.tmpArray = [0, 0];
    }

    get(x, y) {
        if (x.x == undefined) {
            return this.array[y][x].value;
        } else {
            return this.array[x.y][x.x].value;
        }
    }

    getCell(x, y) {
        if (x.x == undefined) {
            return this.array[y][x];
        } else {
            return this.array[x.y][x.x];
        }
    }
    
    set(x, y, value) {
        if (x.x == undefined) {
            this.array[y][x].value = value;
        } else {
            this.array[x.y][x.x].value = y;
        }
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

    isBorderCoord(x, y) {
        if (x.x != undefined) {
            y = x.y;
            x = x.x;
        }
        return x == 0 || y == 0 || x == this.width - 1 || y == this.height - 1;
    }

    hasCoord(x, y) {
        if (x.x != undefined) {
            y = x.y;
            x = x.x;
        }
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
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
                yield this.array[i][j].value;
            }
        }
    }

    *cells() {
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
