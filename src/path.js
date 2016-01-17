import {Directions, DirectionVectors, DirectionNames} from './direction.js';
import {Vec2} from './vec2.js';
import {spread} from './spread.js';

export class Path {
    constructor(start, end) {

        this.start = start;
        this.end = end;

        var dx = end.x - start.x;
        var dy = end.y - start.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
                this.cardinalDirection = Directions.East;
                if (dy > 0) {
                    this.ordinalDirection = Directions.SouthEast;
                } else {
                    //dy <= 0
                    this.ordinalDirection = Directions.NorthEast;
                }
            } else {
                // dx <= 0
                this.cardinalDirection = Directions.West;
                if (dy > 0) {
                    this.ordinalDirection = Directions.SouthWest;
                } else {
                    //dy <= 0
                    this.ordinalDirection = Directions.NorthWest;
                }
            }
        } else {
            // abs(dx) <= abs(dy)
             if (dy > 0) {
                this.cardinalDirection = Directions.South;
                if (dx > 0) {
                    this.ordinalDirection = Directions.SouthEast;
                } else {
                    //dx <= 0
                    this.ordinalDirection = Directions.SouthWest;
                }
            } else {
                // dx <= 0
                this.cardinalDirection = Directions.North;
                if (dx > 0) {
                    this.ordinalDirection = Directions.NorthEast;
                } else {
                    //dx <= 0
                    this.ordinalDirection = Directions.NorthWest;
                }
            }
        }

        this.cardinalVector = DirectionVectors[this.cardinalDirection];
        this.ordinalVector = DirectionVectors[this.ordinalDirection];

        this.ordinalCount = Math.min(Math.abs(dx), Math.abs(dy));
        this.cardinalCount = Math.max(Math.abs(dx), Math.abs(dy)) - this.ordinalCount;

        this.cardinalName = DirectionNames[this.cardinalDirection];
        this.ordinalName = DirectionNames[this.ordinalDirection];

        this.length = this.ordinalCount + this.cardinalCount;

        this.relativeArray = new Array();
        this.absoluteArray = new Array();
        this.directionVectorArray = new Array();

        var relativeCurrent = new Vec2(0, 0);
        var absoluteCurrent = start.clone();

        this.relativeArray.push(relativeCurrent);
        this.absoluteArray.push(absoluteCurrent);

        for (let vec of spread(this.cardinalVector, this.ordinalVector, this.cardinalCount, this.ordinalCount)) {
            relativeCurrent = relativeCurrent.add(vec);
            absoluteCurrent = absoluteCurrent.add(vec);

            this.relativeArray.push(relativeCurrent);
            this.absoluteArray.push(absoluteCurrent);
            this.directionVectorArray.push(vec);
        }
    }

    *iterateAbsolute(infinite = false) {
        yield *this.absoluteArray;
        if (infinite) {
            yield *this.iterateFollowing();
        }
    }

    *iterateFollowing() {
        var current = this.end;
        if (this.length == 0) {
            return;
        }
        while (true) {
            let first = true;
            for (let vec of this.directionVectorArray) {
                current = current.add(vec);
                yield current;
            }
        }
    }
}
